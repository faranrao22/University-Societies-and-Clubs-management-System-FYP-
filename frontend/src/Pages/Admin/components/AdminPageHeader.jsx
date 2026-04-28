import React from "react";
import { adminUi as a } from "./adminUi";

export default function AdminPageHeader({ title, description, actions, eyebrow = "Administration", variant = "default" }) {
  const showEyebrow = variant !== "hero" && eyebrow !== false && eyebrow !== null && eyebrow !== "";

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
