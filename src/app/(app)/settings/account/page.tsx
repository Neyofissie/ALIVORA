"use client";

import { useState } from "react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";

export default function AccountPage() {
  const { currentUser, toast } = useStore();
  const [name, setName] = useState(currentUser.name);
  return (
    <Screen>
      <SubHeader title="Account" />
      <div className="flex flex-col gap-4">
        <div className="flex justify-center py-2"><Avatar member={{ ...currentUser, name: name || currentUser.name }} size="lg" /></div>
        <Field label="Display name">{(p) => <Input {...p} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label="Email" hint="Changing your email requires re-verification.">{(p) => <Input {...p} value={currentUser.email ?? ""} disabled />}</Field>
        <Field label="Language">{(p) => <Input {...p} value="English (UK)" disabled />}</Field>
        <Button block onClick={() => toast({ tone: "success", title: "Profile saved" })} disabled={!name.trim()}>Save</Button>
      </div>
    </Screen>
  );
}
