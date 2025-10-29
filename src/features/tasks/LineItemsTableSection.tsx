import { Badge, Cell, Column, Row, Table, TableBody, TableHeader } from "../../components/ui";
import type { ProposedJournalEntry } from "../../types";
import { computeLineItemTotals, formatCurrency } from "./utils";

interface LineItemsTableSectionProps {
  lineItems: ProposedJournalEntry["lineItems"];
}



export function LineItemsTableSection({ lineItems }: LineItemsTableSectionProps) {
  const { totalDebits, totalCredits, difference, isBalanced } =
    computeLineItemTotals(lineItems);

  const balanceLabel = isBalanced
    ? "Entry balances"
    : `Out of balance by ${formatCurrency(Math.abs(difference))}`;

  return (
    <div>
      <Table aria-label="Journal entry line items">
        <TableHeader>
          <Column>Account</Column>
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
              <Cell>{lineItem.memo || "—"}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
      <div className="mt-3 flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-medium">Totals:</span>{" "}
          <span>{formatCurrency(totalDebits)} debit</span>{" "}
          <span className="mx-1 text-gray-400">|</span>
          <span>{formatCurrency(totalCredits)} credit</span>
        </div>
        <Badge variant={isBalanced ? "success" : "danger"}>{balanceLabel}</Badge>
      </div>
    </div>
  );
}