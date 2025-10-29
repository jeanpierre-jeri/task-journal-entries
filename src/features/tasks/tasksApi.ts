import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  TaskType,
  TaskStatus,
  type Task,
  type PostJournalEntryTask,
  type ReverseJournalEntryTask,
  type ProposedJournalEntry,
  type JournalEntry,
} from "../../types";
import { SAMPLE_PROPOSED_ENTRY } from "./mockData";
import {
  addJournalEntry,
  getJournalEntriesSnapshot,
  journalEntriesApi,
  removeJournalEntry,
} from "../../store/api/journalEntriesApi";

const cloneProposedJournalEntry = (
  entry: ProposedJournalEntry
): ProposedJournalEntry => ({
  ...entry,
  lineItems: entry.lineItems.map((item) => ({ ...item })),
});

const extractSequenceNumber = (entryNumber: string) => {
  const match = entryNumber.match(/(\d+)$/);
  if (!match) {
    return 0;
  }
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : 0;
};

const buildJournalEntryFromProposed = (
  proposed: ProposedJournalEntry,
  existingEntries: JournalEntry[]
): JournalEntry => {
  const nextSequence =
    existingEntries.reduce((max, entry) => {
      const sequence = extractSequenceNumber(entry.entryNumber);
      return sequence > max ? sequence : max;
    }, 0) + 1;

  const sequenceString = String(nextSequence).padStart(3, "0");
  const entryId = `je-${sequenceString}`;
  const createdAt = new Date().toISOString();

  return {
    id: entryId,
    entryNumber: `JE-${sequenceString}`,
    date: proposed.date,
    description: proposed.description,
    createdAt,
    lineItems: proposed.lineItems.map((item, index) => ({
      ...item,
      id: `${entryId}-li-${index + 1}`,
    })),
  };
};

const selectRandomJournalEntryId = (entries: JournalEntry[]) => {
  if (!entries.length) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * entries.length);
  return entries[randomIndex]?.id ?? null;
};

let tasks: Task[] = [];

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { data: tasks };
      },
      providesTags: ["Task"],
    }),

    runTask: builder.mutation<Task, string>({
      queryFn: async (taskId, { dispatch }) => {
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) {
          return { error: { status: 404, data: "Task not found" } };
        }

        const task = tasks[taskIndex];
        const updatedTask: Task = {
          ...task,
          status: TaskStatus.RUNNING,
          lastRunError: undefined,
        };
        tasks = [
          ...tasks.slice(0, taskIndex),
          updatedTask,
          ...tasks.slice(taskIndex + 1),
        ];

        setTimeout(async () => {
          const currentTaskIndex = tasks.findIndex((t) => t.id === taskId);
          if (currentTaskIndex === -1) return;

          const currentTask = tasks[currentTaskIndex];

          if (currentTask.type === TaskType.POST_JOURNAL_ENTRY) {
            const taskWithAction: PostJournalEntryTask = {
              ...currentTask,
              proposedAction: cloneProposedJournalEntry(
                SAMPLE_PROPOSED_ENTRY
              ),
              status: TaskStatus.PENDING_ACTION,
              lastRunAt: new Date().toISOString(),
              lastRunError: undefined,
            } as PostJournalEntryTask;

            tasks = [
              ...tasks.slice(0, currentTaskIndex),
              taskWithAction,
              ...tasks.slice(currentTaskIndex + 1),
            ];

          } else if (currentTask.type === TaskType.REVERSE_JOURNAL_ENTRY) {
            const journalEntries = getJournalEntriesSnapshot();
            const randomJournalEntryId =
              selectRandomJournalEntryId(journalEntries);

            if (!randomJournalEntryId) {
              const failedTask: ReverseJournalEntryTask = {
                ...currentTask,
                status: TaskStatus.FAILED,
                lastRunAt: new Date().toISOString(),
                lastRunError: "No journal entries available to reverse.",
                proposedAction: undefined,
              } as ReverseJournalEntryTask;

              tasks = [
                ...tasks.slice(0, currentTaskIndex),
                failedTask,
                ...tasks.slice(currentTaskIndex + 1),
              ];

              dispatch(tasksApi.util.invalidateTags(["Task"]));
              return;
            }

            const taskWithAction: ReverseJournalEntryTask = {
              ...currentTask,
              proposedAction: {
                journalEntryId: randomJournalEntryId,
              },
              status: TaskStatus.PENDING_ACTION,
              lastRunAt: new Date().toISOString(),
              lastRunError: undefined,
            } as ReverseJournalEntryTask;

            tasks = [
              ...tasks.slice(0, currentTaskIndex),
              taskWithAction,
              ...tasks.slice(currentTaskIndex + 1),
            ];
          } else {
            const completedTask: Task = {
              ...currentTask,
              status: TaskStatus.COMPLETED,
              lastRunAt: new Date().toISOString(),
              lastRunError: undefined,
            };

            tasks = [
              ...tasks.slice(0, currentTaskIndex),
              completedTask,
              ...tasks.slice(currentTaskIndex + 1),
            ];
          }

          dispatch(tasksApi.util.invalidateTags(["Task"]));
        }, 5000);

        return { data: updatedTask };
      },
      invalidatesTags: ["Task"],
    }),

    executeTask: builder.mutation<Task, string>({
      queryFn: async (taskId, { dispatch }) => {
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) {
          return { error: { status: 404, data: "Task not found" } };
        }

        const task = tasks[taskIndex];

        if (task.status !== TaskStatus.PENDING_ACTION) {
          return {
            error: {
              status: 400,
              data: "Task is not ready for execution.",
            },
          };
        }

        let updatedTask: Task | null = null;
        const completionTimestamp = new Date().toISOString();

        if (task.type === TaskType.POST_JOURNAL_ENTRY) {
          const postTask = task as PostJournalEntryTask;
          const proposedAction = postTask.proposedAction;

          if (!proposedAction) {
            return {
              error: {
                status: 422,
                data: "Missing proposed journal entry.",
              },
            };
          }

          const journalEntries = getJournalEntriesSnapshot();
          const newJournalEntry = buildJournalEntryFromProposed(
            proposedAction,
            journalEntries
          );
          addJournalEntry(newJournalEntry);

          updatedTask = {
            ...task,
            status: TaskStatus.COMPLETED,
            lastRunAt: completionTimestamp,
            lastRunError: undefined,
          };
        } else if (task.type === TaskType.REVERSE_JOURNAL_ENTRY) {
          const reverseTask = task as ReverseJournalEntryTask;
          const proposedAction = reverseTask.proposedAction;

          if (!proposedAction) {
            return {
              error: {
                status: 422,
                data: "Missing reversal instruction.",
              },
            };
          }

          const removedEntry = removeJournalEntry(proposedAction.journalEntryId);
          if (!removedEntry) {
            const failedTask: Task = {
              ...task,
              status: TaskStatus.FAILED,
              lastRunAt: completionTimestamp,
              lastRunError: "Journal entry not found for reversal.",
            };

            tasks = [
              ...tasks.slice(0, taskIndex),
              failedTask,
              ...tasks.slice(taskIndex + 1),
            ];

            dispatch(journalEntriesApi.util.invalidateTags(["JournalEntry"]));
            dispatch(tasksApi.util.invalidateTags(["Task"]));

            return {
              error: {
                status: 404,
                data: "Journal entry not found for reversal.",
              },
            };
          }

          updatedTask = {
            ...task,
            status: TaskStatus.COMPLETED,
            lastRunAt: completionTimestamp,
            lastRunError: undefined,
          };
        } else {
          return {
            error: { status: 400, data: "Unsupported task type." },
          };
        }

        tasks = [
          ...tasks.slice(0, taskIndex),
          updatedTask,
          ...tasks.slice(taskIndex + 1),
        ];

        dispatch(journalEntriesApi.util.invalidateTags(["JournalEntry"]));
        return { data: updatedTask };
      },
      invalidatesTags: ["Task"],
    }),

    deleteTask: builder.mutation<void, string>({
      queryFn: async (taskId) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        tasks = tasks.filter((t) => t.id !== taskId);
        return { data: undefined };
      },
      invalidatesTags: ["Task"],
    }),
  }),
});

export const initializeTasks = (initialTasks: Task[]) => {
  tasks = [...initialTasks];
};

export const {
  useGetTasksQuery,
  useRunTaskMutation,
  useExecuteTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
