import { useState } from "react";
import { AlertType } from "@/types/common";

export const useAlert = () => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showCustomAlert = (title: string, message: string, type: AlertType = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  const hideAlert = () => {
    setShowAlertModal(false);
  };

  const getAlertBackgroundColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "rgba(16, 185, 129, 0.2)";
      case "error":
        return "rgba(239, 68, 68, 0.2)";
      case "warning":
        return "rgba(245, 158, 11, 0.2)";
      case "info":
      default:
        return "rgba(59, 130, 246, 0.2)";
    }
  };

  return {
    showAlertModal,
    alertType,
    alertTitle,
    alertMessage,
    showCustomAlert,
    hideAlert,
    getAlertBackgroundColor,
  };
};
