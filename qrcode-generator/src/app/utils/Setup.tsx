"use client";

import { ToastContainer } from "react-toastify";
import useVerify from "../hooks/use-verify";
import "react-toastify/dist/ReactToastify.css";

export default function Setup() {
  useVerify();
  return <ToastContainer />;
}
