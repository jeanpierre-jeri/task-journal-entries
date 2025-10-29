import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { JournalEntry } from "../../types";
import { INITIAL_JOURNAL_ENTRIES } from "../../features/journal-entries/mockData";

const JOURNAL_ENTRIES_STORAGE_KEY = "tasks-journal-entries.journalEntries";

const isStorageAvailable = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readJournalEntriesFromStorage = (): JournalEntry[] | null => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(JOURNAL_ENTRIES_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as JournalEntry[]) : null;
  } catch (error) {
    console.warn(
      "[journalEntriesApi] Failed to read journal entries from localStorage.",
      error
    );
    return null;
  }
};

const writeJournalEntriesToStorage = (entries: JournalEntry[]) => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(
      JOURNAL_ENTRIES_STORAGE_KEY,
      JSON.stringify(entries ?? [])
    );
  } catch (error) {
    console.warn(
      "[journalEntriesApi] Failed to write journal entries to localStorage.",
      error
    );
  }
};

let journalEntries: JournalEntry[] = [...INITIAL_JOURNAL_ENTRIES];

const setJournalEntries = (entries: JournalEntry[]) => {
  journalEntries = entries;
  writeJournalEntriesToStorage(journalEntries);
};

export const getJournalEntriesSnapshot = () => [...journalEntries];

export const addJournalEntry = (entry: JournalEntry) => {
  setJournalEntries([...journalEntries, entry]);
};

export const removeJournalEntry = (journalEntryId: string) => {
  const entryToRemove = journalEntries.find(
    (entry) => entry.id === journalEntryId
  );
  if (!entryToRemove) {
    return null;
  }

  setJournalEntries(
    journalEntries.filter((entry) => entry.id !== journalEntryId)
  );
  return entryToRemove;
};

export const initializeJournalEntries = (entries: JournalEntry[]) => {
  const storedEntries = readJournalEntriesFromStorage();
  if (storedEntries) {
    journalEntries = storedEntries;
    return;
  }

  setJournalEntries([...entries]);
};

export const journalEntriesApi = createApi({
  reducerPath: "journalEntriesApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["JournalEntry"],
  endpoints: (builder) => ({
    getJournalEntries: builder.query<JournalEntry[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: journalEntries };
      },
      providesTags: ["JournalEntry"],
    }),
  }),
});

export const { useGetJournalEntriesQuery } = journalEntriesApi;
