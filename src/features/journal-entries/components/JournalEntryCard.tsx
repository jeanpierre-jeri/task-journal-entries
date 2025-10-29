import { Table, TableHeader, Column, TableBody, Row, Cell } from "../../../components/ui";
import type { JournalEntry } from "../../../types";
import { formatCurrency, formatEntryDate } from "../formatters";

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export const JournalEntryCard = ({ entry }: JournalEntryCardProps) => {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
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
        <Table aria-label={`Line items for ${entry.entryNumber}`}>
          <TableHeader>
            <Column>Account</Column>
            <Column>Debit</Column>
            <Column>Credit</Column>
            <Column>Memo</Column>
          </TableHeader>
          <TableBody>
            {entry.lineItems.map((lineItem) => (
              <Row key={lineItem.id}>
                <Cell>{lineItem.account}</Cell>
                <Cell>{formatCurrency(lineItem.debit)}</Cell>
                <Cell>{formatCurrency(lineItem.credit)}</Cell>
                <Cell>{lineItem.memo ?? "—"}</Cell>
              </Row>
            ))}
          </TableBody>
        </Table>
      </div>
    </article>
  );
};
