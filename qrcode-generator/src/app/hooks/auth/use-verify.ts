import { useVerifyTokenMutation } from "@/redux/features/auth/authApiSlice";
import {
  finishInitialLoad,
  rehydrateAuth,
} from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useEffect } from "react";

export default function useVerify() {
  const dispatch = useAppDispatch();
  const [verifyToken] = useVerifyTokenMutation();

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const part = parts.pop()?.split(";").shift();
      return part ?? null;
    }
    return null;
  };

  useEffect(() => {
    dispatch(rehydrateAuth());
    const token = getCookie("auth-cookie");
    if (token) {
      verifyToken({ token })
        .unwrap()
        .then((response) => {
          if (response.valid) {
            dispatch(rehydrateAuth());
          } else {
            dispatch(finishInitialLoad());
          }
        })
        .catch((error) => {
          console.error("Verification failed:", error);
          dispatch(finishInitialLoad());
        });
    } else {
      dispatch(finishInitialLoad());
    }
  }, [dispatch, verifyToken]);
}
