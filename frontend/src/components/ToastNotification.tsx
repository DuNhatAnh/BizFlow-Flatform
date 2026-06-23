import React from "react";

interface ToastNotificationProps {
  message: string;
  type: "success" | "error" | "info";
}

export default function ToastNotification({ message, type }: ToastNotificationProps) {
  return (
    <>
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-start gap-3.5 px-6 py-4 rounded-xl shadow-2xl border min-w-[340px] max-w-[500px] animate-[slideDown_0.2s_ease-out] ${
          type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : type === "error"
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-blue-50 border-blue-200 text-blue-800"
        }`}
      >
        {type === "success" && (
          <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full shrink-0 mt-0.5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {type === "error" && (
          <div className="p-1 bg-red-100 text-red-600 rounded-full shrink-0 mt-0.5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        {type === "info" && (
          <div className="p-1 bg-blue-100 text-blue-600 rounded-full shrink-0 mt-0.5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-sm font-bold tracking-tight mb-0.5 uppercase opacity-90">
            {type === "success"
              ? "Thành công"
              : type === "error"
              ? "Lỗi hệ thống"
              : "Thông báo"}
          </h4>
          <p className="text-sm leading-relaxed font-sans whitespace-pre-line font-semibold opacity-95">
            {message}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -1.5rem);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
