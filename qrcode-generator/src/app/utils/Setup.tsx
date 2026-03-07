"use client";

import { ToastContainer } from "react-toastify";
import useVerify from "../hooks/auth/use-verify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/custom-toasts.css"; // Custom toast styles
import "./polyfills"; // Cross-browser polyfills - load early

export default function Setup() {
  useVerify();
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="luxury-toast"
      progressClassName="luxury-progress"
    />
  );
}
