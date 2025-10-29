import type { JournalEntry } from "../../../types";
import { LineItemsTableSection } from "./LineItemsTableSection";
import { formatDateTime } from "../utils";

interface ReverseJournalEntryDetailsProps {
  journalEntryId: string;
  journalEntries: JournalEntry[];
}

export function ReverseJournalEntryDetails({
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
              <span>{formatDateTime(entry.date)}</span>
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