import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { tasksApi, initializeTasks } from "./api/tasksApi";
import { INITIAL_TASKS } from "../features/tasks/mockData";
import type { Task, JournalEntry } from "../types";
import {
  journalEntriesApi,
  initializeJournalEntries,
} from "./api/journalEntriesApi";
import { INITIAL_JOURNAL_ENTRIES } from "../features/journal-entries/mockData";

export const store = configureStore({
  reducer: {
    [tasksApi.reducerPath]: tasksApi.reducer,
    [journalEntriesApi.reducerPath]: journalEntriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      tasksApi.middleware,
      journalEntriesApi.middleware
    ),
});

initializeTasks(INITIAL_TASKS as Task[]);
initializeJournalEntries(INITIAL_JOURNAL_ENTRIES as JournalEntry[]);
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
