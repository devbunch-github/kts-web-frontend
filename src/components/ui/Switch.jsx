// src/components/ui/Switch.jsx
import React from "react";

export function Switch({ checked = false, onCheckedChange }) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-rose-400" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default Switch;
