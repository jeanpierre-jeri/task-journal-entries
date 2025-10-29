import { useCallback, useMemo, useState } from "react";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import "react-reflex/styles.css";
import { Close } from "flowbite-react-icons/outline";
import { PageHeader, PageContent } from "../../components/layout";
import {
  Button,
  EmptyState,
} from "../../components/ui";

import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useRunTaskMutation,
  useExecuteTaskMutation,
  useCreateTaskMutation,
  type CreateTaskInput,
} from "./tasksApi";
import TaskTableWrapper from "./TaskTableWrapper";
import { useGetJournalEntriesQuery } from "../../store/api/journalEntriesApi";
import { CreateTaskPanel } from "./CreateTaskPanel";
import { TaskDetailView } from "./TaskDetailView";
import type { Task } from "../../types";












export function TasksScreen() {
  const { data: tasks = [], isLoading } = useGetTasksQuery(undefined, {
    pollingInterval: 1000,
  });
  const [runTask] = useRunTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [executeTask, { isLoading: isExecuting }] = useExecuteTaskMutation();
  const [createTaskMutation, { isLoading: isCreatingTask }] =
    useCreateTaskMutation();
  const { data: journalEntries = [] } = useGetJournalEntriesQuery();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );
  const isPanelOpen = Boolean(selectedTask) || isCreatePanelOpen;

  const handleRunTask = useCallback(async (taskId: string) => {
    try {
      await runTask(taskId).unwrap();
    } catch (error) {
      console.error("Failed to run task:", error);
    }
  }, [runTask])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId).unwrap();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }, [deleteTask])

  const handleViewTask = useCallback((taskId: string) => {
    setIsCreatePanelOpen(false);
    setSelectedTaskId(taskId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedTaskId(null);
    setIsCreatePanelOpen(false);
  }, []);

  const handleCreateTask = useCallback(() => {
    setSelectedTaskId(null);
    setIsCreatePanelOpen(true);
  }, []);

  const handleCreateTaskSubmit = useCallback(
    (input: CreateTaskInput) => createTaskMutation(input).unwrap(),
    [createTaskMutation]
  );

  const handleCreateTaskSuccess = useCallback(
    (task: Task) => {
      setIsCreatePanelOpen(false);
      setSelectedTaskId(task.id);
    },
    []
  );

  const handleExecuteTask = useCallback(async (taskId: string) => {
    try {
      await executeTask(taskId).unwrap();
    } catch (error) {
      console.error("Failed to execute task:", error);
    }
  }, [executeTask]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <PageHeader
        title="Tasks"
        description="Manage journal entry automation tasks"
        actions={
          <>
            <Button variant="secondary" size="sm">
              Filters
            </Button>
            <Button size="sm" onPress={handleCreateTask}>
              Create Task
            </Button>
          </>
        }
      />
      <PageContent className="flex flex-col min-h-0 overflow-hidden">
        {tasks.length > 0 ? (
          <div className="flex-1 min-h-0">
            {isPanelOpen ? (
              <ReflexContainer
                orientation="vertical"
                className="h-full w-full min-w-0"
              >
                <ReflexElement
                  className="left-pane min-w-0 bg-white"
                  minSize={320}
                >
                  <TaskTableWrapper
                    tasks={tasks}
                    onDeleteTask={handleDeleteTask}
                    onRunTask={handleRunTask}
                    onViewTask={handleViewTask}
                  />
                </ReflexElement>

                <ReflexSplitter className="bg-gray-200 cursor-col-resize" />

                <ReflexElement
                  className="right-pane min-w-0 bg-white"
                  minSize={260}
                >
                  <div className="flex h-full flex-col border-l border-gray-300 bg-white">
                    <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
                      <h2 className="text-lg font-semibold">
                        {selectedTask ? "Task Details" : "Create Task"}
                      </h2>
                      <button
                        onClick={handleClosePanel}
                        className="rounded p-1 transition-colors hover:bg-gray-100"
                      >
                        <Close className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                      {selectedTask ? (
                        <TaskDetailView
                          task={selectedTask}
                          onExecute={handleExecuteTask}
                          isExecuting={isExecuting}
                          journalEntries={journalEntries}
                        />
                      ) : (
                        <CreateTaskPanel
                          onSubmit={handleCreateTaskSubmit}
                          onSuccess={handleCreateTaskSuccess}
                          onCancel={handleClosePanel}
                          isSubmitting={isCreatingTask}
                        />
                      )}
                    </div>
                  </div>
                </ReflexElement>
              </ReflexContainer>
            ) : (
              <TaskTableWrapper
                tasks={tasks}
                onDeleteTask={handleDeleteTask}
                onRunTask={handleRunTask}
                onViewTask={handleViewTask}
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="No tasks found"
            description="Create your first task to automate journal entry posting and reversals"
            action={<Button onPress={handleCreateTask}>Create Task</Button>}
          />
        )}
      </PageContent>
    </div>
  );
}












