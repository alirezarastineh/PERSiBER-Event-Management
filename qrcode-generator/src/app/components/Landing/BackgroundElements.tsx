import React from "react";

export default function BackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#1a1a2e] dark:to-[#151523]"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5"></div>
    </div>
  );
}
