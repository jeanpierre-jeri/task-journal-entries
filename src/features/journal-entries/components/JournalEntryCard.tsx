import type { KeyboardEvent } from "react";
import type { JournalEntry } from "../../../types";
import { formatEntryDate } from "../formatters";
import { JournalEntryLineItemsTable } from "./JournalEntryLineItemsTable";

interface JournalEntryCardProps {
  entry: JournalEntry;
  isSelected?: boolean;
  onSelect?: (entryId: string) => void;
  className?: string;
}

export const JournalEntryCard = ({
  entry,
  isSelected = false,
  onSelect,
  className = "",
}: JournalEntryCardProps) => {
  const isInteractive = typeof onSelect === "function";

  const handleSelect = () => {
    onSelect?.(entry.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  const baseClasses =
    "flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm outline-none transition-shadow";
  const interactiveClasses = isInteractive
    ? "cursor-pointer hover:shadow-md focus-visible:ring-2 focus-visible:ring-black"
    : "";
  const selectedClasses = isSelected
    ? "border-black shadow-md ring-2 ring-black"
    : "";

  return (
    <article
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`}
      {...(isInteractive
        ? {
            role: "button",
            tabIndex: 0,
            onClick: handleSelect,
            onKeyDown: handleKeyDown,
          }
        : {})}
    >
      <header className="flex flex-col gap-1">
        <span className="text-lg font-semibold tracking-tight text-gray-900">
          {entry.entryNumber}
        </span>
        <span className="text-sm text-gray-600">
          {formatEntryDate(entry.date)}
        </span>
        {entry.description ? (
          <p className="text-sm text-gray-700">{entry.description}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No description provided</p>
        )}
      </header>

      <div className="overflow-x-auto">
        <JournalEntryLineItemsTable lineItems={entry.lineItems} />
      </div>
    </article>
  );
};
