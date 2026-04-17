import React from "react";
import { adminUi as a } from "./adminUi";

/**
 * @param {{
 *   title: string;
 *   description?: import("react").ReactNode;
 *   actions?: import("react").ReactNode;
 *   eyebrow?: string | false | null;
 *   variant?: "default" | "hero";
 * }} props
 */
export default function AdminPageHeader({ title, description, actions, eyebrow = "Administration", variant = "default" }) {
  const showEyebrow = variant !== "hero" && eyebrow !== false && eyebrow !== null && eyebrow !== "";

  if (variant === "hero") {
    return (
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {description != null && description !== "" ? (
            <div className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              {typeof description === "string" ? <p>{description}</p> : description}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div> : null}
      </div>
    );
  }

  return (
    <div className={a.headerRow}>
      <div className="min-w-0 flex-1">
        {showEyebrow ? <p className={a.eyebrow}>{eyebrow}</p> : null}
        <h1 className={showEyebrow ? "mt-1.5 " + a.h1 : a.h1}>{title}</h1>
        {description != null && description !== "" ? (
          <div className={a.lead}>{typeof description === "string" ? <p>{description}</p> : description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
