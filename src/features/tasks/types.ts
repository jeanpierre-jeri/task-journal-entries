import type { Task } from "../../types";

export interface TaskTableProps {
  tasks: Task[];
  onRunTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onViewTask?: (taskId: string) => void;
}