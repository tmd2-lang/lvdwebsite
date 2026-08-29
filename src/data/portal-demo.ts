export type InvoiceStatus = "Due" | "Upcoming" | "Paid";

export type InvoiceLineItem = {
  id: string;
  name: string;
  detail: string;
  amount: number;
  paid: boolean;
};

export type PortalInvoice = {
  id: string;
  name: string;
  category: string;
  phase: string;
  issued: string;
  due: string;
  amount: number;
  status: InvoiceStatus;
  statusLabel: string;
  lineItems: InvoiceLineItem[];
};

export type PortalDocument = {
  id: string;
  name: string;
  category: "Contracts" | "Design" | "Planning" | "Invoices";
  format: string;
  size: string;
  updated: string;
  note: string;
};

export type PortalPayment = {
  id: string;
  invoiceId: string;
  invoiceName: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
};

export const portalClient = {
  firstName: "Amara",
  couple: "Amara & Julien",
  initials: "AJ",
  eventDate: "May 17, 2027",
  venue: "Meridian House",
  location: "Washington, DC",
  daysToGo: 263,
};

export const portalInvoices: PortalInvoice[] = [
  {
    id: "LVD-1028",
    name: "Floral & spatial design",
    category: "Florals",
    phase: "Design development",
    issued: "Aug 20, 2026",
    due: "Sep 10, 2026",
    amount: 12500,
    status: "Due",
    statusLabel: "Due Sep 10",
    lineItems: [
      { id: "ceremony", name: "Ceremony meadow installation", detail: "Aisle meadows, ceremony focal florals, and on-site styling", amount: 3200, paid: false },
      { id: "personal", name: "Personal flowers", detail: "Bridal bouquet, attendants, boutonnieres, and keepsake wrap", amount: 1850, paid: false },
      { id: "reception", name: "Reception centerpieces", detail: "Guest tables, head table composition, and bar florals", amount: 5400, paid: false },
      { id: "tabletop", name: "Candlelight & tabletop accents", detail: "Tapers, votives, bud vases, and place-setting details", amount: 2050, paid: false },
    ],
  },
  {
    id: "LVD-1022",
    name: "Décor sourcing & rentals",
    category: "Décor",
    phase: "Design development",
    issued: "Aug 25, 2026",
    due: "Nov 1, 2026",
    amount: 8750,
    status: "Upcoming",
    statusLabel: "Due Nov 1",
    lineItems: [
      { id: "linen", name: "Specialty linens", detail: "Reception, cocktail, and accent table textiles", amount: 3100, paid: false },
      { id: "chairs", name: "Reception seating", detail: "Estate chairs with delivery and collection", amount: 3650, paid: false },
      { id: "lounge", name: "Lounge accents", detail: "Side tables, soft seating, and styling objects", amount: 2000, paid: false },
    ],
  },
  {
    id: "LVD-1019",
    name: "Venue styling retainer",
    category: "Production",
    phase: "Foundation",
    issued: "Aug 4, 2026",
    due: "Aug 18, 2026",
    amount: 9500,
    status: "Paid",
    statusLabel: "Paid Aug 18",
    lineItems: [
      { id: "retainer", name: "Venue styling retainer", detail: "Production reservation and design team hold", amount: 9500, paid: true },
    ],
  },
  {
    id: "LVD-1007",
    name: "Creative direction",
    category: "Planning",
    phase: "Foundation",
    issued: "Jul 16, 2026",
    due: "Jul 30, 2026",
    amount: 12500,
    status: "Paid",
    statusLabel: "Paid Jul 30",
    lineItems: [
      { id: "direction", name: "Creative direction", detail: "Visual concept, palette, spatial plan, and vendor brief", amount: 12500, paid: true },
    ],
  },
  {
    id: "LVD-1041",
    name: "Production & installation balance",
    category: "Production",
    phase: "Installation",
    issued: "Scheduled",
    due: "Mar 15, 2027",
    amount: 25200,
    status: "Upcoming",
    statusLabel: "Scheduled Mar 15",
    lineItems: [
      { id: "production", name: "Event production team", detail: "Installation crew, styling leads, and strike team", amount: 12800, paid: false },
      { id: "logistics", name: "Logistics & transportation", detail: "Floral transport, rentals coordination, and handling", amount: 7400, paid: false },
      { id: "installation", name: "Installation materials", detail: "Rigging, mechanics, protection, and consumables", amount: 5000, paid: false },
    ],
  },
];

export const portalDocuments: PortalDocument[] = [
  { id: "doc-1", name: "Signed design agreement", category: "Contracts", format: "PDF", size: "1.8 MB", updated: "Aug 22, 2026", note: "Fully executed" },
  { id: "doc-2", name: "Floral direction proposal", category: "Design", format: "PDF", size: "12.4 MB", updated: "Aug 20, 2026", note: "2 selections to review" },
  { id: "doc-3", name: "Reception floorplan v3", category: "Planning", format: "PDF", size: "4.1 MB", updated: "Aug 17, 2026", note: "Latest floorplan" },
  { id: "doc-4", name: "Design presentation", category: "Design", format: "PDF", size: "18.7 MB", updated: "Aug 11, 2026", note: "Approved direction" },
  { id: "doc-5", name: "Vendor contact sheet", category: "Planning", format: "XLSX", size: "84 KB", updated: "Aug 8, 2026", note: "Working document" },
  { id: "doc-6", name: "Collected invoices — August", category: "Invoices", format: "ZIP", size: "9.3 MB", updated: "Aug 25, 2026", note: "5 invoices" },
];

export const portalPayments: PortalPayment[] = [
  { id: "RCT-2019", invoiceId: "LVD-1019", invoiceName: "Venue styling retainer", date: "Aug 18, 2026", amount: 9500, method: "ACH transfer", reference: "Bank account ending 1042" },
  { id: "RCT-2007", invoiceId: "LVD-1007", invoiceName: "Creative direction", date: "Jul 30, 2026", amount: 12500, method: "Visa", reference: "Card ending 4242" },
];

export const portalPhases = [
  { number: "01", name: "Foundation", date: "Jul — Aug 2026", status: "Complete", description: "Agreement, creative brief, budget framework, and venue walk-through." },
  { number: "02", name: "Design development", date: "Aug — Nov 2026", status: "In progress", description: "Florals, tabletop, floorplan, rentals, and visual proposal approvals." },
  { number: "03", name: "Production", date: "Dec 2026 — Apr 2027", status: "Upcoming", description: "Vendor confirmations, final counts, production schedule, and fabrication." },
  { number: "04", name: "Installation", date: "May 2027", status: "Upcoming", description: "On-site installation, styling, celebration support, and strike." },
];

export function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
