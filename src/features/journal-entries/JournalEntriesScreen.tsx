import { PageHeader, PageContent } from "../../components/layout";
import { EmptyState } from "../../components/ui";
import { useGetJournalEntriesQuery } from "../../store/api/journalEntriesApi";
import { JournalEntryCard } from "./components/JournalEntryCard";

export const JournalEntriesScreen = () => {
  const {
    data: journalEntries = [],
    isLoading,
    isError,
  } = useGetJournalEntriesQuery();

  const showEmptyState = !isLoading && !isError && journalEntries.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader
        title="Journal Entries"
        description="View and manage journal entries"
      />
      <PageContent className="flex-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-600">
            Loading journal entries...
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-red-600">
            Failed to load journal entries. Please try again.
          </div>
        ) : showEmptyState ? (
          <EmptyState
            title="No journal entries found"
            description="Journal entries will appear here when tasks are executed"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {journalEntries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
};
