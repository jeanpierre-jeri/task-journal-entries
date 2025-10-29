import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
} from "../../../components/ui";
import type { LineItem } from "../../../types";
import { formatCurrency } from "../formatters";

interface JournalEntryLineItemsTableProps {
  lineItems: LineItem[];
}

export const JournalEntryLineItemsTable = ({
  lineItems,
}: JournalEntryLineItemsTableProps) => {
  const totals = lineItems.reduce(
    (acc, item) => ({
      debits: acc.debits + item.debit,
      credits: acc.credits + item.credit,
    }),
    { debits: 0, credits: 0 }
  );

  const difference = totals.debits - totals.credits;
  const isBalanced = Math.abs(difference) < 0.01;

  return (
    <div>
      <Table aria-label="Journal entry line items">
        <TableHeader>
          <Column isRowHeader>Account</Column>
          <Column>Debit</Column>
          <Column>Credit</Column>
          <Column>Memo</Column>
        </TableHeader>
        <TableBody>
          {lineItems.map((lineItem) => (
            <Row key={lineItem.id}>
              <Cell>{lineItem.account}</Cell>
              <Cell>{formatCurrency(lineItem.debit)}</Cell>
              <Cell>{formatCurrency(lineItem.credit)}</Cell>
              <Cell>{lineItem.memo ?? "—"}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
      <div className="mt-3 flex flex-col gap-1 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span>Debit: {formatCurrency(totals.debits)}</span>
          <span>Credit: {formatCurrency(totals.credits)}</span>
        </div>
        <span className={isBalanced ? "text-green-600" : "text-red-600"}>
          {isBalanced
            ? "Entry balances."
            : `Out of balance by ${formatCurrency(Math.abs(difference))}.`}
        </span>
      </div>
    </div>
  );
};
