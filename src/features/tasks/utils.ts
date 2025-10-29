import type { ProposedJournalEntry } from "../../types";

export const formatDateTime = (value?: string) => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};



export const computeLineItemTotals = (
  lineItems: ProposedJournalEntry["lineItems"]
) => {
  const { totalDebits, totalCredits } = lineItems.reduce(
    (totals, item) => ({
      totalDebits: totals.totalDebits + item.debit,
      totalCredits: totals.totalCredits + item.credit,
    }),
    { totalDebits: 0, totalCredits: 0 }
  );

  const difference = totalDebits - totalCredits;
  const isBalanced = Math.abs(difference) < 0.01;

  return {
    totalDebits,
    totalCredits,
    difference,
    isBalanced,
  };
};