import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, PageContent } from "../../components/layout";
import { EmptyState } from "../../components/ui";
import { useGetJournalEntriesQuery } from "../../store/api/journalEntriesApi";
import { JournalEntryCard } from "./components/JournalEntryCard";
import { JournalEntryDetailPanel } from "./components/JournalEntryDetailPanel";

export const JournalEntriesScreen = () => {
  const {
    data: journalEntries = [],
    isLoading,
    isError,
  } = useGetJournalEntriesQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const entryIdFromUrl = searchParams.get("entryId");

  const selectedEntry = useMemo(
    () => journalEntries.find((entry) => entry.id === selectedEntryId) ?? null,
    [journalEntries, selectedEntryId]
  );

  const setEntrySearchParam = useCallback(
    (entryId: string | null, options?: { replace?: boolean }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (entryId) {
            next.set("entryId", entryId);
          } else {
            next.delete("entryId");
          }
          return next;
        },
        { replace: options?.replace ?? true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (!journalEntries.length) {
      return;
    }

    if (entryIdFromUrl) {
      const match = journalEntries.find((entry) => entry.id === entryIdFromUrl);
      if (match && selectedEntryId !== entryIdFromUrl) {
        setSelectedEntryId(entryIdFromUrl);
      } else if (!match && selectedEntryId) {
        setSelectedEntryId(null);
        setEntrySearchParam(null);
      }
    } else if (selectedEntryId) {
      setSelectedEntryId(null);
    }
  }, [
    entryIdFromUrl,
    journalEntries,
    selectedEntryId,
    setEntrySearchParam,
  ]);

  useEffect(() => {
    if (!selectedEntryId) {
      return;
    }

    const stillExists = journalEntries.some(
      (entry) => entry.id === selectedEntryId
    );

    if (!stillExists) {
      setSelectedEntryId(null);
      setEntrySearchParam(null);
    }
  }, [journalEntries, selectedEntryId, setEntrySearchParam]);

  const handleSelectEntry = useCallback(
    (entryId: string) => {
      if (selectedEntryId === entryId) {
        return;
      }

      setSelectedEntryId(entryId);
      setEntrySearchParam(entryId);
    },
    [selectedEntryId, setEntrySearchParam]
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedEntryId(null);
    setEntrySearchParam(null);
  }, [setEntrySearchParam]);

  const showEmptyState = !isLoading && !isError && journalEntries.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader
        title="Journal Entries"
        description="View and manage journal entries"
      />
      <PageContent className="flex flex-col min-h-0 overflow-hidden">
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
          <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row">
            <div className="flex-1 min-h-0 overflow-auto p-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {journalEntries.map((entry) => (
                  <JournalEntryCard
                    key={entry.id}
                    entry={entry}
                    onSelect={handleSelectEntry}
                    isSelected={selectedEntryId === entry.id}
                  />
                ))}
              </div>
            </div>
            {selectedEntry && (
              <div className="w-full flex-shrink-0 lg:w-[28rem] p-2">
                <JournalEntryDetailPanel
                  entry={selectedEntry}
                  onClose={handleCloseDetail}
                />
              </div>
            )}
          </div>
        )}
      </PageContent>
    </div>
  );
};
