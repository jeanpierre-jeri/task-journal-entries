import type { JournalEntry } from "../../types";

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "je-001",
    entryNumber: "JE-001",
    date: "2024-09-30",
    description: "September payroll posting",
    createdAt: "2024-09-30T12:00:00Z",
    lineItems: [
      {
        id: "je-001-li-1",
        account: "Salaries Expense",
        debit: 12500,
        credit: 0,
        memo: "Gross payroll",
      },
      {
        id: "je-001-li-2",
        account: "Cash",
        debit: 0,
        credit: 12500,
        memo: "Payroll disbursement",
      },
    ],
  },
  {
    id: "je-002",
    entryNumber: "JE-002",
    date: "2024-10-01",
    description: "October office rent",
    createdAt: "2024-10-01T08:30:00Z",
    lineItems: [
      {
        id: "je-002-li-1",
        account: "Rent Expense",
        debit: 3500,
        credit: 0,
        memo: "Monthly lease payment",
      },
      {
        id: "je-002-li-2",
        account: "Cash",
        debit: 0,
        credit: 3500,
        memo: "Payment to landlord",
      },
    ],
  },
  {
    id: "je-003",
    entryNumber: "JE-003",
    date: "2024-10-15",
    description: "Invoice collection with fee",
    createdAt: "2024-10-15T15:45:00Z",
    lineItems: [
      {
        id: "je-003-li-1",
        account: "Cash",
        debit: 4850,
        credit: 0,
        memo: "Client payment received",
      },
      {
        id: "je-003-li-2",
        account: "Service Fee Expense",
        debit: 150,
        credit: 0,
        memo: "Processing fee",
      },
      {
        id: "je-003-li-3",
        account: "Revenue",
        debit: 0,
        credit: 5000,
        memo: "Recognized revenue",
      },
    ],
  },
];
