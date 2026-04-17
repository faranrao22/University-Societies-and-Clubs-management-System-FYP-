import React from "react";

export default function PublicSectionCard({ className = "", children }) {
  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-sm md:p-6 ${className}`}
      style={{ borderColor: "rgba(30, 64, 175, 0.16)" }}
    >
      {children}
    </section>
  );
}
