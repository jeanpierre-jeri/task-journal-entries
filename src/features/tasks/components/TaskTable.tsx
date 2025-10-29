import { useMemo, useState } from "react";
import type { Key } from "react";
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Badge,
  Button,
  Checkbox,
} from "../../../components/ui";
import { TaskType, TaskStatus, type Task } from "../../../types";
import type { Selection } from "react-aria-components";
import type { TaskTableProps } from "../types";

export function TaskTable({
  tasks,
  onRunTask,
  onDeleteTask,
  onViewTask,
  onRunSelectedTasks,
  isBulkActionLoading,
}: TaskTableProps) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const selectedTaskIds = useMemo(() => {
    if (selectedKeys === "all") {
      return tasks.map((task) => task.id);
    }

    return Array.from(selectedKeys as Set<Key>).map(String);
  }, [selectedKeys, tasks]);

  const hasSelection =
    selectedKeys === "all"
      ? tasks.length > 0
      : (selectedKeys as Set<Key>).size > 0;

  const handleRunSelected = () => {
    if (!onRunSelectedTasks) {
      return;
    }

    if (!selectedTaskIds.length) {
      return;
    }

    onRunSelectedTasks(selectedTaskIds);
    setSelectedKeys(new Set());
  };

  const getStatusVariant = (
    status: Task["status"]
  ): "pending" | "running" | "completed" | "failed" => {
    switch (status) {
      case TaskStatus.RUNNING:
        return "running";
      case TaskStatus.COMPLETED:
        return "completed";
      case TaskStatus.FAILED:
        return "failed";
      default:
        return "pending";
    }
  };

  const getTypeLabel = (type: Task["type"]) => {
    switch (type) {
      case TaskType.POST_JOURNAL_ENTRY:
        return "Post Entry";
      case TaskType.REVERSE_JOURNAL_ENTRY:
        return "Reverse Entry";
      case TaskType.OTHER:
        return "Other";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full flex-col gap-2">
      {hasSelection && onRunSelectedTasks && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onPress={handleRunSelected}
            isDisabled={isBulkActionLoading}
          >
            {isBulkActionLoading ? "Running..." : `Run Selected (${selectedTaskIds.length})`}
          </Button>
        </div>
      )}
      <Table
        aria-label="Tasks"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <TableHeader>
          <Column width="5%">
            <Checkbox slot="selection" />
          </Column>
          <Column isRowHeader width="30%">
            Title
          </Column>
          <Column width="15%">Type</Column>
          <Column width="12%">Status</Column>
          <Column width="18%">Last Run</Column>
          <Column width="20%">Actions</Column>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <Row key={task.id} id={task.id}>
              <Cell>
                <Checkbox slot="selection" />
              </Cell>
              <Cell>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900">
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="text-xs text-gray-500 leading-tight">
                      {task.description}
                    </span>
                  )}
                  {task.lastRunError && (
                    <span className="text-xs text-red-600 leading-tight">
                      Error: {task.lastRunError}
                    </span>
                  )}
                </div>
              </Cell>
              <Cell>
                <Badge variant="default" className="text-xs">
                  {getTypeLabel(task.type)}
                </Badge>
              </Cell>
              <Cell>
                <Badge
                  variant={getStatusVariant(task.status)}
                  className="text-xs"
                >
                  {task.status}
                </Badge>
              </Cell>
              <Cell>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {formatDate(task.lastRunAt)}
                </span>
              </Cell>
              <Cell>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => onViewTask?.(task.id)}
                    className="text-xs"
                  >
                    View
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => onRunTask?.(task.id)}
                    className="text-xs"
                  >
                    Run
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onPress={() => onDeleteTask?.(task.id)}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
