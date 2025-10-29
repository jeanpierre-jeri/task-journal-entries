import { TaskType } from "../../types";

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.POST_JOURNAL_ENTRY]: "Post Entry",
  [TaskType.REVERSE_JOURNAL_ENTRY]: "Reverse Entry",
  [TaskType.OTHER]: "Other",
};