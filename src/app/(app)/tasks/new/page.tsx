"use client";

import { useRouter } from "next/navigation";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { TaskFormView } from "@/components/forms/TaskFormView";
import { ScreenSkeleton } from "@/components/ui/Feedback";
import { newId, useStore } from "@/lib/store";

export default function NewTaskPage() {
  const router = useRouter();
  const { ready, today, currentUser, memberById, dispatch, toast } = useStore();
  return (
    <Screen>
      <SubHeader title="New task" />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <TaskFormView
          submitLabel="Save task"
          initial={{ title: "", description: "", assigneeId: currentUser.id, dueDate: today, priority: "normal", repeat: "none" }}
          onSubmit={(v) => {
            dispatch({ type: "addTask", task: { ...v, id: newId("t"), status: "pending", createdBy: currentUser.id } });
            const assignee = memberById(v.assigneeId);
            toast({
              tone: "success",
              title: "Task created",
              body: assignee && assignee.id !== currentUser.id ? `${assignee.name} will be notified.` : undefined,
            });
            router.push("/tasks");
          }}
        />
      )}
    </Screen>
  );
}
