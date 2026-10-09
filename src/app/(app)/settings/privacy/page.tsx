"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Sheet";
import { useStore } from "@/lib/store";

export default function PrivacyPage() {
  const { state, currentUser, toast } = useStore();
  const [confirm, setConfirm] = useState(false);

  function exportData() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alivora-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ tone: "success", title: "Export ready", body: "Your data has been downloaded." });
  }

  return (
    <Screen>
      <SubHeader title="Privacy & data" />
      <div className="flex flex-col gap-4">
        <section className="rounded-card bg-surface p-5 shadow-soft">
          <h2 className="text-body-lg font-semibold">How we use your data</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-body text-text-secondary">
            <li>Your household&apos;s plans are only visible to its members.</li>
            <li>Alivora AI receives the minimum context needed for a request, and never acts without your confirmation.</li>
            <li>Food preferences are never used to infer anything about you.</li>
            <li>Analytics never include task titles, event names, children&apos;s names or AI conversations.</li>
          </ul>
        </section>
        <Button variant="tertiary" block onClick={exportData}><Download className="size-4" /> Export my data</Button>
        <Button variant="destructive" block onClick={() => setConfirm(true)}><Trash2 className="size-4" /> Delete my account</Button>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete your account?"
        body={currentUser.role === "owner" ? "You own this household. Transfer ownership or delete the household first — this is required before your account can be deleted." : "This permanently deletes your account and personal data."}
        confirmLabel={currentUser.role === "owner" ? "I understand" : "Delete account"}
        onConfirm={() => toast({ tone: "warning", title: "Ownership transfer required", body: "Account deletion is completed in a later sprint." })}
      />
    </Screen>
  );
}
