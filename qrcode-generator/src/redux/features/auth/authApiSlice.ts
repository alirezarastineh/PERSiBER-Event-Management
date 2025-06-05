import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  VerifyTokenRequest,
} from "@/types/auth";
import apiSlice from "../../api/apiSlice";
import { logout, setAuth } from "./authSlice";

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuth(data));
        } catch (error) {
          console.error("Registration error:", error);
        }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuth(data));
        } catch (error) {
          console.error("Login error:", error);
        }
      },
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),
    verifyToken: builder.mutation<{ valid: boolean }, VerifyTokenRequest>({
      query: (data) => ({
        url: "/auth/verify",
        method: "POST",
        body: data,
      }),
    }),
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuth(data));
        } catch (error) {
          console.error("Refresh token error:", error);
        }
      },
    }),
    protected: builder.query<{ message: string }, void>({
      query: () => ({
        url: "/auth/protected",
        method: "GET",
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      onQueryStarted(_, { dispatch }) {
        localStorage.clear();
        dispatch(logout());
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useVerifyTokenMutation,
  useRefreshTokenMutation,
  useProtectedQuery,
  useLogoutMutation,
} = authApiSlice;

export default authApiSlice;
