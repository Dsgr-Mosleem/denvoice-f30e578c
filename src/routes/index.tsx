import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, MessageCircle, Plus, Save, Search, Trash2, FilePlus2 } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { InvoicePreview } from "@/components/InvoicePreview";
import { nextNumber, rupiah, total, waMessage, waPhone, type Invoice, type Item } from "@/lib/invoice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Invoice Generator — DESIGNER_MOSLEEM" },
      { name: "description", content: "Buat, simpan, unduh PDF, dan kirim invoice jasa desain DESIGNER_MOSLEEM ke WhatsApp." },
      { property: "og:title", content: "Invoice Generator — DESIGNER_MOSLEEM" },
      { property: "og:description", content: "Invoice jasa desain grafis profesional dari DESIGNER_MOSLEEM." },
    ],
  }),
  component: App,
});

const KEY = "dm_invoices";
const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const newItem = (): Item => ({ id: uid(), name: "", qty: 1, price: 0, discount: 0 });
const blank = (list: Invoice[]): Invoice => ({
  id: uid(), number: nextNumber(list), clientName: "", clientPhone: "", clientAddress: "",
  date: today(), dueDate: "", items: [newItem()], notes: "Pembayaran via transfer bank. Revisi maks. 2x.", status: "belum",
});

const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function App() {
  const [list, setList] = useState<Invoice[]>([]);
  const [inv, setInv] = useState<Invoice>(() => blank([]));
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "lunas" | "belum">("all");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const l: Invoice[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    setList(l);
    setInv(blank(l));
  }, []);
  const persist = (l: Invoice[]) => { setList(l); localStorage.setItem(KEY, JSON.stringify(l)); };

  const set = <K extends keyof Invoice>(k: K, v: Invoice[K]) => setInv((p) => ({ ...p, [k]: v }));
  const setItem = (id: string, patch: Partial<Item>) => set("items", inv.items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const save = () => {
    const exists = list.some((i) => i.id === inv.id);
    persist(exists ? list.map((i) => (i.id === inv.id ? inv : i)) : [inv, ...list]);
  };
  const saved = list.some((i) => i.id === inv.id);

  const filtered = useMemo(() => list.filter((i) =>
    (filter === "all" || i.status === filter) &&
    (i.clientName + i.number).toLowerCase().includes(q.toLowerCase())), [list, q, filter]);

  const downloadPdf = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
      const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);
      pdf.save(`${inv.number}-${inv.clientName || "klien"}.pdf`);
    } finally { setBusy(false); }
  };

  const sendWa = () => {
    const phone = waPhone(inv.clientPhone);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMessage(inv))}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <header className="bg-brand text-primary-foreground">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-6 py-4">
          <img src={logo.url} alt="DESIGNER_MOSLEEM" className="h-10 w-10 rounded-lg bg-primary-foreground object-contain p-1" />
          <div className="leading-none">
            <div className="font-display text-2xl tracking-wide">DESIGNER MOSLEEM</div>
            <div className="text-xs opacity-80">Invoice Generator</div>
          </div>
          <button onClick={() => setInv(blank(list))} className="ml-auto flex items-center gap-2 rounded-md bg-primary-foreground/15 px-4 py-2 text-sm font-medium hover:bg-primary-foreground/25">
            <FilePlus2 className="h-4 w-4" /> Invoice baru
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-6 p-6 xl:grid-cols-[300px_1fr_auto]">
        {/* History */}
        <aside className="rounded-xl border bg-card p-4 xl:max-h-[calc(100vh-120px)] xl:overflow-auto">
          <h2 className="mb-3 font-semibold">Riwayat Invoice</h2>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input className={input + " pl-9"} placeholder="Cari klien / nomor" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="mb-3 flex gap-1 text-xs">
            {(["all", "lunas", "belum"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-1 rounded-md px-2 py-1.5 font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {f === "all" ? "Semua" : f === "lunas" ? "Lunas" : "Belum"}
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada invoice.</p>}
          <ul className="space-y-2">
            {filtered.map((i) => (
              <li key={i.id} onClick={() => setInv(i)} className={`cursor-pointer rounded-lg border p-3 text-sm hover:border-primary ${inv.id === i.id ? "border-primary bg-accent" : ""}`}>
                <div className="flex justify-between font-semibold"><span>{i.number}</span>
                  <span className={`text-xs ${i.status === "lunas" ? "text-primary" : "text-destructive"}`}>{i.status === "lunas" ? "Lunas" : "Belum"}</span></div>
                <div className="truncate text-muted-foreground">{i.clientName || "-"}</div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{i.date}</span><span className="font-medium">{rupiah(total(i))}</span></div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Form */}
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display whitespace-nowrap text-3xl tracking-wide text-primary">{inv.number}</h2>
            <select className={input + " w-auto"} value={inv.status} onChange={(e) => set("status", e.target.value as Invoice["status"])}>
              <option value="belum">Belum lunas</option><option value="lunas">Lunas</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Nama klien<input className={input} value={inv.clientName} onChange={(e) => set("clientName", e.target.value)} /></label>
            <label className="text-sm">No. WhatsApp klien<input className={input} placeholder="08xxxx" value={inv.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} /></label>
            <label className="text-sm sm:col-span-2">Alamat klien<input className={input} value={inv.clientAddress} onChange={(e) => set("clientAddress", e.target.value)} /></label>
            <label className="text-sm">Tanggal<input type="date" className={input} value={inv.date} onChange={(e) => set("date", e.target.value)} /></label>
            <label className="text-sm">Jatuh tempo<input type="date" className={input} value={inv.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></label>
          </div>

          <div>
            <div className="mb-2 grid grid-cols-[1fr_60px_120px_70px_32px] gap-2 text-xs font-medium text-muted-foreground">
              <span>Jasa desain</span><span>Qty</span><span>Harga (Rp)</span><span>Disc %</span><span />
            </div>
            <datalist id="jasa">{["Desain Poster", "Desain Undangan", "Desain Infografis", "Desain Kartu Ucapan", "Desain Sertifikat", "Desain Feed Instagram", "Desain Banner"].map((j) => <option key={j} value={j} />)}</datalist>
            <div className="space-y-2">
              {inv.items.map((i) => (
                <div key={i.id} className="grid grid-cols-[1fr_60px_120px_70px_32px] gap-2">
                  <input list="jasa" className={input} placeholder="Desain Poster" value={i.name} onChange={(e) => setItem(i.id, { name: e.target.value })} />
                  <input type="number" min={1} className={input} value={i.qty} onChange={(e) => setItem(i.id, { qty: +e.target.value })} />
                  <input type="number" min={0} step={1000} className={input} value={i.price} onChange={(e) => setItem(i.id, { price: +e.target.value })} />
                  <input type="number" min={0} max={100} className={input} value={i.discount} onChange={(e) => setItem(i.id, { discount: +e.target.value })} />
                  <button aria-label="Hapus item" onClick={() => set("items", inv.items.filter((x) => x.id !== i.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => set("items", [...inv.items, newItem()])} className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"><Plus className="h-4 w-4" /> Tambah item</button>
          </div>

          <label className="block text-sm">Catatan<textarea rows={3} className={input} value={inv.notes} onChange={(e) => set("notes", e.target.value)} /></label>

          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{rupiah(total(inv))}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={save} className="bg-brand flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground"><Save className="h-4 w-4" /> {saved ? "Simpan perubahan" : "Simpan invoice"}</button>
            <button onClick={downloadPdf} disabled={busy} className="flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary disabled:opacity-50"><Download className="h-4 w-4" /> {busy ? "Membuat PDF..." : "Download PDF (A4)"}</button>
            <button onClick={sendWa} disabled={!inv.clientPhone} className="flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary disabled:opacity-50"><MessageCircle className="h-4 w-4" /> Kirim ke WhatsApp</button>
            {saved && <button onClick={() => { persist(list.filter((x) => x.id !== inv.id)); setInv(blank(list.filter((x) => x.id !== inv.id))); }} className="ml-auto text-sm text-destructive">Hapus</button>}
          </div>
        </section>

        {/* Preview */}
        <section className="overflow-auto">
          <div className="mb-2 text-sm font-medium text-muted-foreground">Preview live</div>
          <div className="origin-top-left shadow-2xl" style={{ width: 794 * 0.72, height: 1123 * 0.72 }}>
            <div style={{ transform: "scale(0.72)", transformOrigin: "top left" }}>
              <InvoicePreview ref={ref} inv={inv} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
