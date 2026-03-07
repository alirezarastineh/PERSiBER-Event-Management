import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { AuthResponse, RefreshTokenRequest } from "@/types/auth";
import { Mutex } from "async-mutex";
import { logout, setAuth } from "../features/auth/authSlice";

const mutex = new Mutex();

// ==================== Cross-Browser Storage Utilities ====================

/**
 * Cross-browser safe storage access
 * Handles Safari's ITP, Firefox's ETP, and private browsing modes
 */
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (globalThis.window === undefined) return null;
      return globalThis.window.localStorage.getItem(key);
    } catch {
      // Handle Safari private mode, quota exceeded, etc.
      // eslint-disable-next-line no-console
      console.warn(`Storage access failed for key: ${key}`);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (globalThis.window === undefined) return false;
      globalThis.window.localStorage.setItem(key, value);
      return true;
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`Storage write failed for key: ${key}`);
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      if (globalThis.window === undefined) return;
      globalThis.window.localStorage.removeItem(key);
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`Storage remove failed for key: ${key}`);
    }
  },
};

// ==================== Environment Detection ====================

const isLocalhost =
  globalThis.window !== undefined &&
  (globalThis.window.location?.hostname === "localhost" ||
    globalThis.window.location?.hostname === "127.0.0.1" ||
    globalThis.window.location?.hostname === "[::1]");

const baseUrl =
  process.env.NODE_ENV === "production" && !isLocalhost
    ? process.env.NEXT_PUBLIC_HOST_PROD
    : process.env.NEXT_PUBLIC_HOST_DEV;

// ==================== Request Timeout Configuration ====================

// Request timeout value (exported for potential use in custom requests)
export const REQUEST_TIMEOUT = 30000; // 30 seconds default timeout

/**
 * Create an AbortController with timeout
 * Cross-browser compatible with fallback for older browsers
 * Exported for use in custom fetch requests outside of RTK Query
 */
export const createTimeoutController = (
  timeout: number = REQUEST_TIMEOUT,
): AbortController | null => {
  if (typeof AbortController === "undefined") {
    // eslint-disable-next-line no-console
    console.warn("AbortController not supported - request timeout will not work");
    return null;
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
};

// ==================== Base Query Configuration ====================

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}`,

  prepareHeaders: (headers, { endpoint }) => {
    // Get token from storage with cross-browser fallback
    const token = safeStorage.getItem("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Ensure proper content-type for cross-browser compatibility
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Add custom header for tracking (useful for debugging)
    headers.set("X-Requested-With", "XMLHttpRequest");

    // Add Accept header for proper content negotiation
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    // Cache control for proper caching behavior across browsers
    // Don't cache auth-related endpoints
    if (endpoint === "refresh" || endpoint === "login" || endpoint === "logout") {
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("Pragma", "no-cache");
    }

    return headers;
  },

  // Include credentials for cookie-based auth
  // Important for Safari's ITP and cross-origin requests
  credentials: "include",

  // Response handler for cross-browser compatibility
  responseHandler: async (response) => {
    // Check content type before parsing
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        // eslint-disable-next-line no-console
        console.warn("Failed to parse JSON response");
        return null;
      }
    }

    // Handle text responses
    if (contentType?.includes("text/")) {
      return await response.text();
    }

    // Default to trying JSON
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  },
});

// ==================== Token Refresh Logic ====================

/** Extra options type for base query */
type ExtraOptions = Record<string, unknown>;

const refreshTokenFn = async (
  api: BaseQueryApi,
  extraOptions: ExtraOptions,
): Promise<string | null> => {
  const storedRefreshToken = safeStorage.getItem("refreshToken");

  if (!storedRefreshToken) {
    api.dispatch(logout());
    return null;
  }

  try {
    const refreshResult = await baseQuery(
      {
        url: "/refresh",
        method: "POST",
        body: { refreshToken: storedRefreshToken } as RefreshTokenRequest,
      },
      api,
      extraOptions,
    );

    if ((refreshResult.data as AuthResponse)?.accessToken) {
      const {
        accessToken,
        refreshToken: newRefreshToken,
        user,
      } = refreshResult.data as AuthResponse;

      // Store tokens with cross-browser fallback
      const accessStored = safeStorage.setItem("accessToken", accessToken);
      const refreshStored = safeStorage.setItem("refreshToken", newRefreshToken);

      if (!accessStored || !refreshStored) {
        // eslint-disable-next-line no-console
        console.warn("Failed to store tokens - user may need to re-authenticate");
      }

      api.dispatch(setAuth({ user, accessToken, refreshToken: newRefreshToken }));
      return accessToken;
    } else {
      // Token refresh failed
      api.dispatch(logout());
      return null;
    }
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Token refresh error:", error);
    api.dispatch(logout());
    return null;
  }
};

// ==================== Enhanced Base Query with Reauth ====================

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  // Wait for any ongoing refresh to complete
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - need to refresh token
  if (result.error?.status === 401) {
    if (mutex.isLocked()) {
      // Another refresh is in progress, wait for it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Acquire lock and attempt refresh
      const release = await mutex.acquire();
      try {
        const accessToken = await refreshTokenFn(api, extraOptions as ExtraOptions);
        if (accessToken) {
          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
        }
      } finally {
        release();
      }
    }
  }

  // Handle network errors gracefully for cross-browser compatibility
  if (result.error) {
    const error = result.error;

    // Network error - might be offline or CORS issue
    if (error.status === "FETCH_ERROR") {
      // eslint-disable-next-line no-console
      console.warn("Network error - check internet connection or CORS configuration");
    }

    // Timeout error
    if (error.status === "TIMEOUT_ERROR") {
      // eslint-disable-next-line no-console
      console.warn("Request timed out - server may be slow or unreachable");
    }

    // Parsing error - response format issue
    if (error.status === "PARSING_ERROR") {
      // eslint-disable-next-line no-console
      console.warn("Response parsing error - unexpected response format");
    }
  }

  return result;
};

// ==================== API Slice Definition ====================

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Guest", "Member", "Bpplist", "Event", "User"],

  // Performance optimization: keep unused data in cache for 60 seconds
  keepUnusedDataFor: 60,

  // Reduce unnecessary refetch on focus
  // Safari handles window focus differently, so this prevents excessive requests
  refetchOnFocus: false,

  // Reduce unnecessary refetch on reconnect
  // Cross-browser online/offline detection varies
  refetchOnReconnect: false,

  endpoints: (builder) => ({
    // Health check endpoint
    ping: builder.query<{ ok: boolean }, void>({
      query: () => ({
        url: "/ping",
        method: "GET",
      }),
    }),
  }),
});

// ==================== Export Utilities ====================

export { safeStorage };
export default apiSlice;

// Re-export common error types for use in components
export type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
