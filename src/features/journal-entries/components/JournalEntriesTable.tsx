import { useMemo } from "react";
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Button,
} from "../../../components/ui";
import type { JournalEntry } from "../../../types";
import { formatCurrency, formatEntryDate } from "../formatters";

interface JournalEntriesTableProps {
  entries: JournalEntry[];
  onViewEntry?: (entryId: string) => void;
}

export const JournalEntriesTable = ({ entries, onViewEntry }: JournalEntriesTableProps) => {
  const rows = useMemo(
    () =>
      entries.map((entry) => {
        const totals = entry.lineItems.reduce(
          (acc, li) => ({
            debits: acc.debits + li.debit,
            credits: acc.credits + li.credit,
          }),
          { debits: 0, credits: 0 }
        );

        return {
          ...entry,
          lineCount: entry.lineItems.length,
          debitTotal: totals.debits,
          creditTotal: totals.credits,
        };
      }),
    [entries]
  );

  return (
    <Table aria-label="Journal Entries">
      <TableHeader>
        <Column isRowHeader width="18%">Entry #</Column>
        <Column width="14%">Date</Column>
        <Column>Description</Column>
        <Column width="10%">Lines</Column>
        <Column width="14%">Debits</Column>
        <Column width="14%">Credits</Column>
        <Column width="12%">Actions</Column>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <Row key={row.id} id={row.id}>
            <Cell>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900">
                  {row.entryNumber}
                </span>
              </div>
            </Cell>
            <Cell>
              <span className="text-xs text-gray-700 whitespace-nowrap">
                {formatEntryDate(row.date)}
              </span>
            </Cell>
            <Cell>
              <span className="text-sm text-gray-900 truncate block max-w-[36rem]">
                {row.description || "—"}
              </span>
            </Cell>
            <Cell>
              <span className="text-xs text-gray-700">{row.lineCount}</span>
            </Cell>
            <Cell>
              <span className="text-xs text-gray-700">
                {formatCurrency(row.debitTotal)}
              </span>
            </Cell>
            <Cell>
              <span className="text-xs text-gray-700">
                {formatCurrency(row.creditTotal)}
              </span>
            </Cell>
            <Cell>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => onViewEntry?.(row.id)}
                  className="text-xs"
                >
                  View
                </Button>
              </div>
            </Cell>
          </Row>
        ))}
      </TableBody>
    </Table>
  );
};

