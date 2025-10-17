import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | string): string {
  if (typeof error === "string") {
    return error;
  }

  if ("status" in error) {
    return (error.data as { detail?: string })?.detail ?? "An unexpected error occurred";
  }

  if ("message" in error) {
    return error.message ?? "An unexpected error occurred";
  }

  return "An unknown error occurred";
}
