import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { JournalEntry } from "../../types";
import { INITIAL_JOURNAL_ENTRIES } from "../../features/journal-entries/mockData";

let journalEntries: JournalEntry[] = [...INITIAL_JOURNAL_ENTRIES];

export const getJournalEntriesSnapshot = () => [...journalEntries];

export const addJournalEntry = (entry: JournalEntry) => {
  journalEntries = [...journalEntries, entry];
};

export const removeJournalEntry = (journalEntryId: string) => {
  const entryToRemove = journalEntries.find(
    (entry) => entry.id === journalEntryId
  );
  if (!entryToRemove) {
    return null;
  }

  journalEntries = journalEntries.filter((entry) => entry.id !== journalEntryId);
  return entryToRemove;
};

export const initializeJournalEntries = (entries: JournalEntry[]) => {
  journalEntries = [...entries];
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
