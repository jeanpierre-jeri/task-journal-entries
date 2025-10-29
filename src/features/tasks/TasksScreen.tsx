import { useCallback, useState } from "react";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import "react-reflex/styles.css";
import { Close } from "flowbite-react-icons/outline";
import { PageHeader, PageContent } from "../../components/layout";
import { Button, EmptyState } from "../../components/ui";
import type { Task } from "../../types";
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useRunTaskMutation,
} from "./tasksApi";
import TaskTableWrapper from "./TaskTableWrapper"

export function TasksScreen() {
  const { data: tasks = [], isLoading } = useGetTasksQuery(undefined, {
    pollingInterval: 1000,
  });
  const [runTask] = useRunTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  }, [tasks])

  const handleClosePanel = () => {
    setSelectedTask(null);
  };

  const handleCreateTask = () => {
    console.log("Create task clicked");
    // TODO: Implement create task logic
  };

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
            {selectedTask ? (
              <ReflexContainer
                orientation="vertical"
                className="h-full w-full min-w-0"
              >
                <ReflexElement className="left-pane min-w-0 bg-white" minSize={320}>
                  <TaskTableWrapper tasks={tasks} onDeleteTask={handleDeleteTask} onRunTask={handleRunTask} onViewTask={handleViewTask} />
                </ReflexElement>



                <ReflexSplitter className="bg-gray-200 cursor-col-resize" />

                <ReflexElement
                  className="right-pane min-w-0 bg-white"
                  minSize={260}
                >
                  <div className="flex h-full flex-col border-l border-gray-300 bg-white">
                    {selectedTask ? (
                      <>
                        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
                          <h2 className="text-lg font-semibold">Task Details</h2>
                          <button
                            onClick={handleClosePanel}
                            className="rounded p-1 transition-colors hover:bg-gray-100"
                          >
                            <Close className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          <h3 className="mb-2 text-base font-semibold">
                            {selectedTask.title}
                          </h3>
                          <p className="mb-4 text-sm text-gray-600">
                            {selectedTask.description}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Status: </span>
                              <span>{selectedTask.status}</span>
                            </div>
                            <div>
                              <span className="font-medium">Type: </span>
                              <span>{selectedTask.type}</span>
                            </div>
                            <div>
                              <span className="font-medium">Created: </span>
                              <span>
                                {new Date(selectedTask.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {selectedTask.lastRunAt && (
                              <div>
                                <span className="font-medium">Last Run: </span>
                                <span>
                                  {new Date(selectedTask.lastRunAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {selectedTask.lastRunError && (
                              <div className="text-red-600">
                                <span className="font-medium">Error: </span>
                                <span>{selectedTask.lastRunError}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-gray-500">
                        Select a task to view its details.
                      </div>
                    )}
                  </div>
                </ReflexElement>
              </ReflexContainer>
            ) : (
              <TaskTableWrapper tasks={tasks} onDeleteTask={handleDeleteTask} onRunTask={handleRunTask} onViewTask={handleViewTask} />
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
