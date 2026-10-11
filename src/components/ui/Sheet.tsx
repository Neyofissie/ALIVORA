"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "./Button";

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-fade fixed inset-0 z-40 bg-text-primary/40" />
        <Dialog.Content className="animate-sheet-up pb-safe fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90dvh] max-w-[480px] overflow-y-auto rounded-t-[var(--radius-sheet)] bg-surface px-5 pt-3 focus:outline-none">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-h3 font-semibold">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="text-body text-text-secondary">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="-mt-1 -mr-2 inline-flex size-11 items-center justify-center rounded-full text-text-secondary hover:bg-primary-soft"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="pb-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Destructive actions always require explicit confirmation (PRD §7). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
  extraAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  extraAction?: { label: string; onClick: () => void };
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-fade fixed inset-0 z-40 bg-text-primary/40" />
        <Dialog.Content
          role="alertdialog"
          className="animate-fade-up fixed top-1/2 left-1/2 z-50 w-[calc(100%-40px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card bg-surface p-6 focus:outline-none"
        >
          <Dialog.Title className="text-h3 font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-body text-text-secondary">{body}</Dialog.Description>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="destructive"
              block
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
            {extraAction && (
              <Button
                variant="tertiary"
                block
                onClick={() => {
                  extraAction.onClick();
                  onOpenChange(false);
                }}
              >
                {extraAction.label}
              </Button>
            )}
            <Dialog.Close asChild>
              <Button variant="ghost" block>
                Cancel
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
