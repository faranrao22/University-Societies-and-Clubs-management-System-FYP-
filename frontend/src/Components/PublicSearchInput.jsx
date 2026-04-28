import React from "react";
import { Search } from "lucide-react";

/**
 * Unified public-site search field (Societies, Events, Elections, etc.).
 */
const PublicSearchInput = React.forwardRef(function PublicSearchInput(
  {
    value,
    onChange,
    placeholder = "Search…",
    onKeyDown,
    className = "",
    inputClassName = "",
    id,
    name,
    disabled = false,
    "aria-label": ariaLabel,
    autoComplete = "off",
    compact = false,
  },
  ref
) {
  const iconLeft = compact ? "left-3" : "left-4";
  const iconSize = compact ? 16 : 18;
  const inputPad = compact
    ? "py-2 pl-9 pr-3 text-sm"
    : "py-3 pl-11 pr-4 text-sm sm:text-base";

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`pointer-events-none absolute ${iconLeft} top-1/2 -translate-y-1/2 text-gray-400`}
        size={iconSize}
        aria-hidden
      />
      <input
        ref={ref}
        id={id}
        name={name}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={ariaLabel || placeholder}
        className={`w-full rounded-xl border border-[rgba(30,64,175,0.18)] bg-white text-gray-900 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 disabled:cursor-not-allowed disabled:opacity-60 ${inputPad} ${inputClassName}`}
      />
    </div>
  );
});

PublicSearchInput.displayName = "PublicSearchInput";

export default PublicSearchInput;
