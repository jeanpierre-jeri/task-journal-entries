import { memo } from "react";
import type { JournalEntry } from "../../../types";
import { JournalEntriesTable } from "./JournalEntriesTable";

interface Props {
  entries: JournalEntry[];
  onViewEntry?: (entryId: string) => void;
}

function JournalEntriesTableWrapper({ entries, onViewEntry }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden pr-2">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[48rem]">
          <JournalEntriesTable entries={entries} onViewEntry={onViewEntry} />
        </div>
      </div>
    </div>
  );
}

export default memo(JournalEntriesTableWrapper);

