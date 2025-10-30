import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { AuthResponse, RefreshTokenRequest } from "@/types/auth";
import { Mutex } from "async-mutex";
import { logout, setAuth } from "../features/auth/authSlice";

const mutex = new Mutex();

const isLocalhost =
  globalThis.window &&
  (globalThis.window.location.hostname === "localhost" ||
    globalThis.window.location.hostname === "127.0.0.1");

const baseUrl =
  process.env.NODE_ENV === "production" && !isLocalhost
    ? process.env.NEXT_PUBLIC_HOST_PROD
    : process.env.NEXT_PUBLIC_HOST_DEV;

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}`,
  prepareHeaders: (headers) => {
    const token = globalThis.window ? globalThis.window.localStorage.getItem("accessToken") : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const refreshToken = async (api: any, extraOptions: any) => {
  const refreshToken = globalThis.window
    ? globalThis.window.localStorage.getItem("refreshToken")
    : null;
  if (!refreshToken) {
    api.dispatch(logout());
    return null;
  }

  const refreshResult = await baseQuery(
    {
      url: "/refresh",
      method: "POST",
      body: { refreshToken } as RefreshTokenRequest,
    },
    api,
    extraOptions,
  );

  if ((refreshResult.data as AuthResponse)?.accessToken) {
    const { accessToken, refreshToken, user } = refreshResult.data as AuthResponse;
    globalThis.window.localStorage.setItem("accessToken", accessToken);
    globalThis.window.localStorage.setItem("refreshToken", refreshToken);
    api.dispatch(setAuth({ user, accessToken, refreshToken }));
    return accessToken;
  } else {
    api.dispatch(logout());
    return null;
  }
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (mutex.isLocked()) {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    } else {
      const release = await mutex.acquire();
      try {
        const access = await refreshToken(api, extraOptions);
        if (access) {
          result = await baseQuery(args, api, extraOptions);
        }
      } finally {
        release();
      }
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Guest", "Member", "Bpplist", "Event", "User"],
  // Performance optimization: keep unused data in cache for 60 seconds
  keepUnusedDataFor: 60,
  // Reduce unnecessary refetch on focus
  refetchOnFocus: false,
  // Reduce unnecessary refetch on reconnect
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    ping: builder.query<{ ok: boolean }, void>({
      query: () => "/ping",
    }),
  }),
});

export default apiSlice;
