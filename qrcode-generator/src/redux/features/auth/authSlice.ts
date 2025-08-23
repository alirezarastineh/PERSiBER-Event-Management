import { AuthState, User } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiSlice from "../../api/apiSlice";

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        user?: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        ...action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        username: action.payload.user?.username ?? "",
        role: action.payload.user?.role ?? "user",
        _id: action.payload.user?._id ?? "", // Provide default empty string for _id
      };
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);

      // Add null checks for user properties
      if (action.payload.user?.username) {
        localStorage.setItem("username", action.payload.user.username);
      }

      if (action.payload.user?.role) {
        localStorage.setItem("role", action.payload.user.role);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      apiSlice.util.resetApiState();
    },
    finishInitialLoad: (state) => {
      state.isLoading = false;
    },
    rehydrateAuth: (state) => {
      const isAuthenticated =
        localStorage.getItem("isAuthenticated") === "true";
      if (isAuthenticated) {
        state.isAuthenticated = true;
        state.user = {
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken"),
          username: localStorage.getItem("username") ?? "",
          role: localStorage.getItem("role") ?? "",
        } as User;
      }
      state.isLoading = false;
    },
  },
});

export const { setAuth, logout, finishInitialLoad, rehydrateAuth } =
  authSlice.actions;
export default authSlice.reducer;
