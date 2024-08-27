import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { AuthResponse, RefreshTokenRequest } from "@/types/types";
import { Mutex } from "async-mutex";
import { logout, setAuth } from "../features/auth/authSlice";

const mutex = new Mutex();

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const baseUrl =
  process.env.NODE_ENV === "production" && !isLocalhost
    ? process.env.NEXT_PUBLIC_HOST_PROD
    : process.env.NEXT_PUBLIC_HOST_DEV;

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}`,
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const refreshToken = async (api: any, extraOptions: any) => {
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
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
    extraOptions
  );

  if (refreshResult.data && (refreshResult.data as AuthResponse).accessToken) {
    const { accessToken, refreshToken, user } =
      refreshResult.data as AuthResponse;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    api.dispatch(setAuth({ user, accessToken, refreshToken }));
    return accessToken;
  } else {
    api.dispatch(logout());
    return null;
  }
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const access = await refreshToken(api, extraOptions);
        if (access) {
          result = await baseQuery(args, api, extraOptions);
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});

export default apiSlice;
