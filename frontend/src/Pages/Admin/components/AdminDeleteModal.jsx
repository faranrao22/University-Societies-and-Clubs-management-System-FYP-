import React from "react";
import AdminConfirmModal from "./AdminConfirmModal";

/**
 * Standard admin delete confirmation — use this for every destructive delete in the admin console.
 */
export default function AdminDeleteModal({
  open,
  onClose,
  title = "Confirm deletion",
  description,
  confirmLabel = "Delete",
  onConfirm,
  isPending = false,
  pendingLabel = "Deleting…",
}) {
  return (
    <AdminConfirmModal
      open={open}
      onClose={onClose}
      title={title}
      message={description}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      danger
      isPending={isPending}
      pendingLabel={pendingLabel}
    />
  );
}
