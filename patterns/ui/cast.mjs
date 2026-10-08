/**
 * The reference cast every mock draws from: one neutral business application.
 *
 * Acme Supply is a wholesale supplier with a back office. Its people take orders
 * from customers, ship them, invoice them, and handle returns and refunds. The
 * cast names no product, no market and no real company, so a pattern drawn with
 * it reads as a pattern, not as one product's screen. Every mock in the library
 * uses this cast, so a reader moving between options meets the same records.
 */

/** The organization the back office belongs to. */
export const COMPANY = {
  name: "Acme Supply",
  email: "hello@acme-supply.example",
  phone: "+31 20 555 0100",
  address: "Canal Street 12, 1011 AB Amsterdam",
  plan: "Business",
  planPrice: "EUR 49.00 a month",
};

/** The one order most mocks are about: a paid order of three lines. */
export const ORDER = {
  number: "SO-1042",
  customer: "Maria Garcia",
  company: "Garcia Interiors",
  email: "maria@garcia-interiors.example",
  placed: "8 Oct 2026, 09:32",
  state: "Paid",
  total: "EUR 125.00",
  lines: 3,
};

/** The product most lines refer to. */
export const PRODUCT = {
  name: "Oak desk lamp",
  sku: "LMP-OAK-01",
  price: "EUR 45.00",
  stock: 412,
  warehouse: "Amsterdam warehouse",
};

/** A delivery or an appointment with a date: the record a schedule shows. */
export const DELIVERY = {
  name: "Garcia Interiors restock",
  date: "Sat 14 Mar 2026",
  window: "08:00 to 12:00",
  place: "Amsterdam warehouse",
  capacity: "40 pallets",
};

/** The invoice the money mocks show. */
export const INVOICE = {
  number: "INV-2041",
  issued: "1 Oct 2026",
  due: "31 Oct 2026",
  total: "EUR 1,240.00",
};

/** The people who work in the back office, and the customers they serve. */
export const PEOPLE = {
  owner: { name: "Sam Rivera", role: "Owner", initials: "SR" },
  manager: { name: "Alex Morgan", role: "Operations manager", initials: "AM" },
  finance: { name: "Priya Shah", role: "Finance", initials: "PS" },
  support: { name: "Jordan Lee", role: "Support", initials: "JL" },
  warehouse: { name: "Chris Novak", role: "Warehouse lead", initials: "CN" },
  customer: { name: "Maria Garcia", role: "Customer", initials: "MG" },
  otherCustomer: { name: "Tom Becker", role: "Customer", initials: "TB" },
};

/** Amounts the mocks reuse, written the same way everywhere. */
export const MONEY = {
  lamp: "EUR 45.00",
  shipping: "EUR 5.00",
  lineTotal: "EUR 90.00",
  order: "EUR 125.00",
  refund: "EUR 45.00",
  fee: "EUR 2.15",
  payout: "EUR 122.85",
  invoice: "EUR 1,240.00",
  subscription: "EUR 49.00",
  monthRevenue: "EUR 54,180.00",
};

/** The states a record holds, each with the tone it is drawn in. */
export const STATES = {
  draft: { label: "Draft", tone: "neutral" },
  active: { label: "Active", tone: "positive" },
  paused: { label: "Paused", tone: "caution" },
  archived: { label: "Archived", tone: "neutral" },
  paid: { label: "Paid", tone: "positive" },
  awaiting: { label: "Awaiting payment", tone: "caution" },
  refunded: { label: "Refunded", tone: "neutral" },
  failed: { label: "Failed", tone: "destructive" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  disputed: { label: "Disputed", tone: "destructive" },
  shipped: { label: "Shipped", tone: "positive" },
  delivered: { label: "Delivered", tone: "positive" },
  backordered: { label: "Backordered", tone: "caution" },
  scheduled: { label: "Scheduled", tone: "info" },
  overdue: { label: "Overdue", tone: "destructive" },
};

/** Refusals a mock words on screen, each with a stable code and a sentence that says what to do. */
export const REFUSALS = {
  stockExceeded: {
    code: "inventory/stock.not-enough",
    title: "Not enough stock",
    detail: "The Amsterdam warehouse holds 12 Oak desk lamps. The order asks for 20.",
  },
  windowClosed: {
    code: "payments/refund.window-closed",
    title: "The refund window has closed",
    detail: "This payment method refunds only within 180 days of the payment. This one is 214 days old.",
  },
  alreadyRefunded: {
    code: "payments/order.already-refunded",
    title: "This order is already refunded",
    detail: "EUR 45.00 went back to Maria Garcia on 6 Oct 2026. Nothing is left to refund.",
  },
  roleRefused: {
    code: "identity/role.action-not-granted",
    title: "Your role cannot do this",
    detail: "Support can read orders and message customers. Only Finance can issue a refund.",
  },
  staleVersion: {
    code: "concurrency/record.changed-elsewhere",
    title: "Someone else changed this",
    detail: "Priya Shah saved changes to this order at 09:34. Look at her version, then save yours again.",
  },
  paymentPending: {
    code: "payments/payment.not-settled",
    title: "The payment has not settled",
    detail: "The customer's payment was authorised and is still with the bank. Nothing can ship yet.",
  },
};
