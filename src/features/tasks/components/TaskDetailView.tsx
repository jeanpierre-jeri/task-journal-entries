import { Button } from "../../../components/ui";
import { TaskStatus, TaskType, type JournalEntry, type PostJournalEntryTask, type ReverseJournalEntryTask, type Task } from "../../../types";
import { TASK_TYPE_LABELS } from "../constants";
import { ProposedJournalEntryDetails } from "./ProposedJournalEntryDetails";
import { ReverseJournalEntryDetails } from "./ReverseJournalEntryDetails";
import { formatDateTime } from "../utils";

interface TaskDetailViewProps {
  task: Task;
  journalEntries: JournalEntry[];
  onExecute: (taskId: string) => Promise<void>;
  isExecuting: boolean;
}



export function TaskDetailView({
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