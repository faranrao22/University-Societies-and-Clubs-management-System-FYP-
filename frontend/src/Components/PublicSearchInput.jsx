import React from "react";
import { Search } from "lucide-react";

/**
 * Unified public-site search input.
 */
export default function PublicSearchInput({
  value,
  onChange,
  placeholder = "Search…",
  onKeyDown,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[rgba(30,64,175,0.18)] bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 sm:text-base"
      />
    </div>
  );
}
