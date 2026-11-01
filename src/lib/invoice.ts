export type Item = { id: string; name: string; qty: number; price: number; discount: number };
export type Invoice = {
  id: string;
  number: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  date: string;
  dueDate: string;
  items: Item[];
  notes: string;
  status: "lunas" | "belum";
};

export const BRAND = {
  name: "DESIGNER_MOSLEEM",
  phone: "+62 899-3966-234",
  address: "Imogiri, Bantul, Yogyakarta, IDN",
  accountName: "ILYAS ARRIBATH",
  accounts: [
    { label: "BANK BSI", value: "7349037054" },
    { label: "DANA", value: "+62 851-5076-9286" },
  ],
};

export const lineTotal = (i: Item) => i.qty * i.price * (1 - Math.min(Math.max(i.discount, 0), 100) / 100);
export const subtotal = (inv: Pick<Invoice, "items">) => inv.items.reduce((s, i) => s + i.qty * i.price, 0);
export const total = (inv: Pick<Invoice, "items">) => inv.items.reduce((s, i) => s + lineTotal(i), 0);
export const formatNumber = (n: number) => `INV-${String(n).padStart(4, "0")}`;
export const rupiah = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

/** Next number = highest existing number + 1 (never reuses deleted numbers if counter higher). */
export function nextNumber(invoices: Pick<Invoice, "number">[], counter = 0) {
  const max = invoices.reduce((m, i) => Math.max(m, parseInt(i.number.replace(/\D/g, "")) || 0), counter);
  return formatNumber(max + 1);
}

export function waPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return d;
}

export function waMessage(inv: Invoice) {
  const lines = inv.items.map((i) => `• ${i.name} (${i.qty}x)${i.discount ? ` disc ${i.discount}%` : ""}: ${rupiah(lineTotal(i))}`);
  return [
    `Assalamu'alaikum ${inv.clientName},`,
    ``,
    `Berikut ringkasan invoice dari *${BRAND.name}*:`,
    `No: *${inv.number}*`,
    `Tanggal: ${inv.date}${inv.dueDate ? ` | Jatuh tempo: ${inv.dueDate}` : ""}`,
    ``,
    ...lines,
    ``,
    `*Total: ${rupiah(total(inv))}*`,
    `Status: ${inv.status === "lunas" ? "LUNAS ✅" : "Belum lunas"}`,
    ``,
    `Pembayaran:`,
    ...BRAND.accounts.map((a) => `${a.label}: ${a.value}`),
    `a.n. ${BRAND.accountName}`,
    ``,
    `Terima kasih 🙏`,
    `${BRAND.name} • ${BRAND.phone}`,
  ].join("\n");
}
