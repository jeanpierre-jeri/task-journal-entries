import { memo } from "react";
import { TaskTable } from "./TaskTable";
import type { TaskTableProps } from "../types";

function TaskTableWrapper({
  tasks,
  onDeleteTask,
  onRunTask,
  onViewTask,
  onRunSelectedTasks,
  isBulkActionLoading,
}: TaskTableProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden pr-2">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[48rem]">
          <TaskTable
            tasks={tasks}
            onRunTask={onRunTask}
            onDeleteTask={onDeleteTask}
            onViewTask={onViewTask}
            onRunSelectedTasks={onRunSelectedTasks}
            isBulkActionLoading={isBulkActionLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(TaskTableWrapper);
