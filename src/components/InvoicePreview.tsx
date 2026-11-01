import { forwardRef } from "react";
import logo from "@/assets/logo.png.asset.json";
import { BRAND, lineTotal, rupiah, subtotal, total, type Invoice } from "@/lib/invoice";

export const InvoicePreview = forwardRef<HTMLDivElement, { inv: Invoice }>(({ inv }, ref) => {
  const sub = subtotal(inv);
  const tot = total(inv);
  return (
    <div ref={ref} className="relative flex flex-col bg-card text-foreground" style={{ width: 794, minHeight: 1123 }}>
      <div className="bg-brand relative overflow-hidden px-12 pb-10 pt-12 text-primary-foreground">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[28px] border-primary-foreground/10" />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-foreground p-2">
              <img src={logo.url} alt="logo" crossOrigin="anonymous" className="h-12 w-12 object-contain" />
            </div>
            <div className="leading-none">
              <div className="font-display text-3xl tracking-wide">DESIGNER</div>
              <div className="text-xs tracking-[0.5em] opacity-80">MOSLEEM</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-6xl leading-none tracking-wider">INVOICE</div>
            <div className="mt-1 text-sm opacity-90">{inv.number}</div>
          </div>
        </div>
        <div className="mt-6 flex items-start justify-between gap-6">
          <div className="whitespace-pre-line text-xs opacity-80">{`Graphic Design Service\n${BRAND.phone}\n${BRAND.address}`}</div>
          <div className="shrink-0 rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-3 text-xs">
            <div className="mb-1 font-semibold uppercase tracking-[0.2em] opacity-90">Pembayaran</div>
            {BRAND.accounts.map((a) => (
              <div key={a.label} className="flex items-baseline justify-between gap-5">
                <span className="opacity-80">{a.label}</span>
                <span className="font-semibold tabular-nums tracking-wide">{a.value}</span>
              </div>
            ))}
            <div className="mt-1 text-right opacity-80">a.n. {BRAND.accountName}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-12 py-8 text-sm">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Ditagihkan kepada</div>
          <div className="text-lg font-semibold">{inv.clientName || "Nama klien"}</div>
          {inv.clientPhone && <div className="text-muted-foreground">{inv.clientPhone}</div>}
          {inv.clientAddress && <div className="whitespace-pre-line text-muted-foreground">{inv.clientAddress}</div>}
        </div>
        <div className="text-right">
          <div className="text-muted-foreground">Tanggal: <span className="font-medium text-foreground">{inv.date}</span></div>
          {inv.dueDate && <div className="text-muted-foreground">Jatuh tempo: <span className="font-medium text-foreground">{inv.dueDate}</span></div>}
          <div className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${inv.status === "lunas" ? "bg-primary text-primary-foreground" : "border border-destructive text-destructive"}`}>
            {inv.status === "lunas" ? "Lunas" : "Belum lunas"}
          </div>
        </div>
      </div>

      <div className="px-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-left text-primary-foreground">
              <th className="px-3 py-2 font-medium">Jasa Desain</th>
              <th className="px-3 py-2 text-center font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Harga</th>
              <th className="px-3 py-2 text-center font-medium">Disc</th>
              <th className="px-3 py-2 text-right font-medium">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((i, idx) => (
              <tr key={i.id} className={idx % 2 ? "bg-muted" : ""}>
                <td className="px-3 py-2">{i.name || "-"}</td>
                <td className="px-3 py-2 text-center">{i.qty}</td>
                <td className="px-3 py-2 text-right">{rupiah(i.price)}</td>
                <td className="px-3 py-2 text-center">{i.discount ? `${i.discount}%` : "-"}</td>
                <td className="px-3 py-2 text-right font-medium">{rupiah(lineTotal(i))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-6 w-72 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{rupiah(sub)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Diskon</span><span>- {rupiah(sub - tot)}</span></div>
          <div className="bg-brand mt-2 flex justify-between rounded-lg px-4 py-3 text-base font-bold text-primary-foreground">
            <span>TOTAL</span><span>{rupiah(tot)}</span>
          </div>
        </div>
      </div>

      {inv.notes && (
        <div className="mx-12 mt-8 border-l-4 border-primary bg-muted px-4 py-3 text-sm">
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Catatan</div>
          <div className="whitespace-pre-line">{inv.notes}</div>
        </div>
      )}

      <div className="mt-auto px-12 pb-10 pt-12">
        <div className="flex items-end justify-between border-t pt-4 text-xs text-muted-foreground">
          <div>Terima kasih atas kepercayaan Anda 🙏</div>
          <div className="font-display text-lg tracking-widest text-primary">{BRAND.name}</div>
        </div>
      </div>
      <div className="bg-brand h-3" />
    </div>
  );
});
InvoicePreview.displayName = "InvoicePreview";
