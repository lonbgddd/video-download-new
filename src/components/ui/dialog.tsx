"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
export function Modal({ open, onOpenChange, title, closeLabel = "Close", children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; closeLabel?: string; children: React.ReactNode }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="modal-content"><div className="modal-heading"><Dialog.Title>{title}</Dialog.Title><Dialog.Close aria-label={closeLabel}><X size={20}/></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
