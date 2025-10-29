import type { ProposedJournalEntry } from "../../../types";
import { LineItemsTableSection } from "./LineItemsTableSection";
import { formatDateTime } from "../utils";

interface ProposedJournalEntryDetailsProps {
  entry: ProposedJournalEntry;
}

export function ProposedJournalEntryDetails({
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
          <span>{formatDateTime(entry.date)}</span>
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