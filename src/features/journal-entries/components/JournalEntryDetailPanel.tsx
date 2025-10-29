import { Close } from "flowbite-react-icons/outline";
import type { JournalEntry } from "../../../types";
import { formatEntryDate } from "../formatters";
import { JournalEntryLineItemsTable } from "./JournalEntryLineItemsTable";

interface JournalEntryDetailPanelProps {
  entry: JournalEntry;
  onClose: () => void;
}

export const JournalEntryDetailPanel = ({
  entry,
  onClose,
}: JournalEntryDetailPanelProps) => {
  return (
    <aside className="flex h-full flex-col border-l pl-6 border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Journal Entry Details
          </h2>
          <p className="text-sm text-gray-500">{entry.entryNumber}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <Close className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase text-gray-500">
                Entry Number
              </h3>
              <p className="mt-1 text-sm text-gray-900">{entry.entryNumber}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase text-gray-500">
                Date
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatEntryDate(entry.date)}
              </p>
            </div>
            {entry.description && (
              <div className="sm:col-span-2">
                <h3 className="text-xs font-semibold uppercase text-gray-500">
                  Description
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {entry.description}
                </p>
              </div>
            )}
          </div>

          <JournalEntryLineItemsTable lineItems={entry.lineItems} />
        </div>
      </div>
    </aside>
  );
};
