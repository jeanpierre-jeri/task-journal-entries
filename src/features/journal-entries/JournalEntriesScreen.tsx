import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import "react-reflex/styles.css";
import { PageHeader, PageContent } from "../../components/layout";
import { EmptyState } from "../../components/ui";
import { useGetJournalEntriesQuery } from "../../store/api/journalEntriesApi";
import { JournalEntryDetailPanel } from "./components/JournalEntryDetailPanel";
import JournalEntriesTableWrapper from "./components/JournalEntriesTableWrapper";

export const JournalEntriesScreen = () => {
  const {
    data: journalEntries = [],
    isLoading,
    isError,
  } = useGetJournalEntriesQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEntryId = searchParams.get("entryId");

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
    if (!selectedEntryId || selectedEntry) {
      return;
    }

    setEntrySearchParam(null);
  }, [selectedEntryId, selectedEntry, setEntrySearchParam]);

  const handleSelectEntry = useCallback(
    (entryId: string) => {
      if (selectedEntryId === entryId) {
        return;
      }

      setEntrySearchParam(entryId);
    },
    [selectedEntryId, setEntrySearchParam]
  );

  const handleCloseDetail = useCallback(() => {
    setEntrySearchParam(null);
  }, [setEntrySearchParam]);

  const showEmptyState = !isLoading && !isError && journalEntries.length === 0;
  const isPanelOpen = Boolean(selectedEntry);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
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
          <div className="flex-1 min-h-0">
            {isPanelOpen ? (
              <ReflexContainer orientation="vertical" className="h-full w-full min-w-0">
                <ReflexElement className="left-pane min-w-0 bg-white" minSize={320}>
                  <JournalEntriesTableWrapper
                    entries={journalEntries}
                    onViewEntry={handleSelectEntry}
                  />
                </ReflexElement>

                <ReflexSplitter className="bg-gray-200 cursor-col-resize" />

                <ReflexElement className="right-pane min-w-0 bg-white" minSize={260}>
                  <JournalEntryDetailPanel entry={selectedEntry!} onClose={handleCloseDetail} />
                </ReflexElement>
              </ReflexContainer>
            ) : (
              <JournalEntriesTableWrapper
                entries={journalEntries}
                onViewEntry={handleSelectEntry}
              />
            )}
          </div>
        )}
      </PageContent>
    </div>
  );
};
