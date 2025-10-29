import { useCallback, useMemo, useState } from "react";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import "react-reflex/styles.css";
import { Close } from "flowbite-react-icons/outline";
import { PageHeader, PageContent } from "../../components/layout";
import {
  Badge,
  Button,
  EmptyState,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
} from "../../components/ui";
import {
  TaskType,
  TaskStatus,
  type Task,
  type JournalEntry,
  type ProposedJournalEntry,
  type PostJournalEntryTask,
  type ReverseJournalEntryTask,
} from "../../types";
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useRunTaskMutation,
  useExecuteTaskMutation,
} from "./tasksApi";
import TaskTableWrapper from "./TaskTableWrapper";
import { useGetJournalEntriesQuery } from "../../store/api/journalEntriesApi";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (value?: string) => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.POST_JOURNAL_ENTRY]: "Post Entry",
  [TaskType.REVERSE_JOURNAL_ENTRY]: "Reverse Entry",
  [TaskType.OTHER]: "Other",
};

const computeLineItemTotals = (
  lineItems: ProposedJournalEntry["lineItems"]
) => {
  const { totalDebits, totalCredits } = lineItems.reduce(
    (totals, item) => ({
      totalDebits: totals.totalDebits + item.debit,
      totalCredits: totals.totalCredits + item.credit,
    }),
    { totalDebits: 0, totalCredits: 0 }
  );

  const difference = totalDebits - totalCredits;
  const isBalanced = Math.abs(difference) < 0.01;

  return {
    totalDebits,
    totalCredits,
    difference,
    isBalanced,
  };
};

export function TasksScreen() {
  const { data: tasks = [], isLoading } = useGetTasksQuery(undefined, {
    pollingInterval: 1000,
  });
  const [runTask] = useRunTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [executeTask, { isLoading: isExecuting }] = useExecuteTaskMutation();
  const { data: journalEntries = [] } = useGetJournalEntriesQuery();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

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
    setSelectedTaskId(taskId);
  }, [])

  const handleClosePanel = () => {
    setSelectedTaskId(null);
  };

  const handleCreateTask = () => {
    console.log("Create task clicked");
    // TODO: Implement create task logic
  };

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
                        <TaskDetailView
                          task={selectedTask}
                          onExecute={handleExecuteTask}
                          isExecuting={isExecuting}
                          journalEntries={journalEntries}
                        />
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

interface TaskDetailViewProps {
  task: Task;
  journalEntries: JournalEntry[];
  onExecute: (taskId: string) => Promise<void>;
  isExecuting: boolean;
}

function TaskDetailView({
  task,
  journalEntries,
  onExecute,
  isExecuting,
}: TaskDetailViewProps) {
  const proposedContent = (() => {
    if (task.type === TaskType.POST_JOURNAL_ENTRY) {
      const proposedEntry = (task as PostJournalEntryTask).proposedAction;
      if (!proposedEntry) {
        return null;
      }
      return (
        <ProposedJournalEntryDetails entry={proposedEntry} />
      );
    }

    if (task.type === TaskType.REVERSE_JOURNAL_ENTRY) {
      const proposedReverse = (task as ReverseJournalEntryTask).proposedAction;
      if (!proposedReverse) {
        return null;
      }
      return (
        <ReverseJournalEntryDetails
          journalEntryId={proposedReverse.journalEntryId}
          journalEntries={journalEntries}
        />
      );
    }

    return null;
  })();

  const hasProposedAction = Boolean(proposedContent);
  const canExecute =
    task.status === TaskStatus.PENDING_ACTION && hasProposedAction;

  return (
    <div className="flex-1 overflow-auto p-4">
      <h3 className="mb-2 text-base font-semibold">{task.title}</h3>
      {task.description && (
        <p className="mb-4 text-sm text-gray-600">{task.description}</p>
      )}
      <div className="space-y-2 text-sm text-gray-700">
        <div>
          <span className="font-medium">Status:</span>{" "}
          <span className="uppercase tracking-wide text-gray-800">
            {task.status}
          </span>
        </div>
        <div>
          <span className="font-medium">Type:</span>{" "}
          <span>{TASK_TYPE_LABELS[task.type] ?? task.type}</span>
        </div>
        <div>
          <span className="font-medium">Created:</span>{" "}
          <span>{formatDateTime(task.createdAt)}</span>
        </div>
        <div>
          <span className="font-medium">Last Run:</span>{" "}
          <span>{formatDateTime(task.lastRunAt)}</span>
        </div>
        {task.lastRunError && (
          <div className="text-red-600">
            <span className="font-medium">Error:</span>{" "}
            <span>{task.lastRunError}</span>
          </div>
        )}
      </div>

      {proposedContent}

      {canExecute && (
        <div className="mt-6">
          <Button
            onPress={() => void onExecute(task.id)}
            isDisabled={isExecuting}
            size="sm"
          >
            {isExecuting ? "Executing..." : "Execute Action"}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ProposedJournalEntryDetailsProps {
  entry: ProposedJournalEntry;
}

function ProposedJournalEntryDetails({
  entry,
}: ProposedJournalEntryDetailsProps) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-900">
        Proposed Journal Entry
      </h4>
      <div className="mt-2 grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-4">
        <div>
          <span className="font-medium text-gray-700">Date:</span>{" "}
          <span>{formatDate(entry.date)}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Description:</span>{" "}
          <span>{entry.description || "—"}</span>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <LineItemsTableSection lineItems={entry.lineItems} />
      </div>
    </div>
  );
}

interface ReverseJournalEntryDetailsProps {
  journalEntryId: string;
  journalEntries: JournalEntry[];
}

function ReverseJournalEntryDetails({
  journalEntryId,
  journalEntries,
}: ReverseJournalEntryDetailsProps) {
  const entry = journalEntries.find(
    (journalEntry) => journalEntry.id === journalEntryId
  );

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-900">
        Proposed Reversal
      </h4>
      <div className="mt-2 space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Journal Entry ID:</span>{" "}
          <span>{journalEntryId}</span>
        </div>
        {entry ? (
          <>
            <div>
              <span className="font-medium text-gray-700">
                Entry Number:
              </span>{" "}
              <span>{entry.entryNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date:</span>{" "}
              <span>{formatDate(entry.date)}</span>
            </div>
            {entry.description && (
              <div>
                <span className="font-medium text-gray-700">
                  Description:
                </span>{" "}
                <span>{entry.description}</span>
              </div>
            )}
            <div className="mt-4 overflow-x-auto">
              <LineItemsTableSection lineItems={entry.lineItems} />
            </div>
          </>
        ) : (
          <div className="text-gray-600">
            Details for this journal entry are no longer available.
          </div>
        )}
      </div>
    </div>
  );
}

interface LineItemsTableSectionProps {
  lineItems: ProposedJournalEntry["lineItems"];
}

function LineItemsTableSection({ lineItems }: LineItemsTableSectionProps) {
  const { totalDebits, totalCredits, difference, isBalanced } =
    computeLineItemTotals(lineItems);

  const balanceLabel = isBalanced
    ? "Entry balances"
    : `Out of balance by ${formatCurrency(Math.abs(difference))}`;

  return (
    <div>
      <Table aria-label="Journal entry line items">
        <TableHeader>
          <Column>Account</Column>
          <Column>Debit</Column>
          <Column>Credit</Column>
          <Column>Memo</Column>
        </TableHeader>
        <TableBody>
          {lineItems.map((lineItem) => (
            <Row key={lineItem.id}>
              <Cell>{lineItem.account}</Cell>
              <Cell>{formatCurrency(lineItem.debit)}</Cell>
              <Cell>{formatCurrency(lineItem.credit)}</Cell>
              <Cell>{lineItem.memo || "—"}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
      <div className="mt-3 flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-medium">Totals:</span>{" "}
          <span>{formatCurrency(totalDebits)} debit</span>{" "}
          <span className="mx-1 text-gray-400">|</span>
          <span>{formatCurrency(totalCredits)} credit</span>
        </div>
        <Badge variant={isBalanced ? "success" : "danger"}>{balanceLabel}</Badge>
      </div>
    </div>
  );
}
