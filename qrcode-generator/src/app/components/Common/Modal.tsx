"use client";

import { ReactNode, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

type ModalProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly title?: string;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title = "Modal Title",
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    } else {
      window.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={contentRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-3xl max-h-[90vh] w-full overflow-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 bg-transparent hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-4 break-words whitespace-pre-line hyphens-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
