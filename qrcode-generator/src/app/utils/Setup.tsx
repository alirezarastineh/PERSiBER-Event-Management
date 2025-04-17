"use client";

import { ToastContainer } from "react-toastify";
import useVerify from "../hooks/use-verify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/custom-toasts.css"; // We'll create this file

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
