import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select Service",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Is everything selected?
  const allSelected = options.length > 0 && value.length === options.length;

  const toggleOption = (id) => {
    if (id === "all") {
      onChange(allSelected ? [] : options.map((o) => o.id));
      return;
    }
    const newVal = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(newVal);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 text-sm hover:border-rose-400 focus:ring-2 focus:ring-rose-200 bg-white transition-all"
      >
        <span className="truncate text-left">
          {value.length
            ? `${value.length} selected`
            : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <label
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-rose-50 rounded-md cursor-pointer text-sm font-medium text-gray-700"
            onClick={() => toggleOption("all")}
          >
            <input
              type="checkbox"
              readOnly
              checked={allSelected}
              className="rounded border-gray-300 accent-rose-500"
            />
            All Services
          </label>

          <div className="max-h-48 overflow-y-auto mt-1">
            {options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-rose-50 rounded-md cursor-pointer text-sm text-gray-700"
                onClick={() => toggleOption(opt.id)}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={value.includes(opt.id)}
                  className="rounded border-gray-300 accent-rose-500"
                />
                {opt.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
