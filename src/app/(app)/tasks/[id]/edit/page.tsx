"use client";

import { useParams, useRouter } from "next/navigation";
import { ListX } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { TaskFormView } from "@/components/forms/TaskFormView";
import { EmptyState, ScreenSkeleton } from "@/components/ui/Feedback";
import { useStore } from "@/lib/store";

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, state, dispatch, toast } = useStore();
  const task = state.tasks.find((t) => t.id === id);
  return (
    <Screen>
      <SubHeader title="Edit task" />
      {!ready ? (
        <ScreenSkeleton />
      ) : !task ? (
        <EmptyState icon={ListX} title="Task not found" body="It may have been deleted." />
      ) : (
        <TaskFormView
          submitLabel="Save changes"
          initial={{ title: task.title, description: task.description ?? "", assigneeId: task.assigneeId, dueDate: task.dueDate, dueTime: task.dueTime, priority: task.priority, repeat: task.repeat }}
          onSubmit={(v) => {
            dispatch({ type: "updateTask", task: { ...task, ...v } });
            toast({ tone: "success", title: "Task updated" });
            router.push(`/tasks/${task.id}`);
          }}
        />
      )}
    </Screen>
  );
}
