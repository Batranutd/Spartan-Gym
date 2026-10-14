import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, Camera, CheckCircle2, CreditCard, Minus, Plus, ScanLine, Search, ShoppingCart, Ticket, Trash2, XCircle } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Avatar, Badge, Segmented } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { toast } from "../../components/ui/Toast";
import { Panel, type AdminPageProps } from "./AdminApp";
import { ClientDrawer } from "./AdminClients";
import { dayOf, fmtTime, today } from "../../lib/date";
import { fullName, subInfo } from "../../lib/derive";
import { lei } from "../../lib/id";
import type { PayMethod, SaleItem } from "../../data/types";

async function decodeQrFromFile(file: File): Promise<string | null> {
  try {
    const { BrowserQRCodeReader } = await import("@zxing/library");
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const r = await new BrowserQRCodeReader().decodeFromImageElement(img);
    URL.revokeObjectURL(url);
    return r.getText();
  } catch {
    return null;
  }
}

export function AdminDesk(_: AdminPageProps) {
  const s = useStore();
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{ ok: boolean; title: string; text: string; clientId?: string } | null>(null);
  const [code, setCode] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [open, setOpen] = useState<string | null>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const matches = q.trim().length >= 2 ? s.clients.filter((c) => `${fullName(c)} ${c.memberId} ${c.phone}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : [];

  const doCheck = (clientId: string) => {
    const c = s.clients.find((x) => x.id === clientId)!;
    const r = s.checkIn(clientId, "recepție");
    const info = subInfo(useStore.getState(), clientId);
    setResult({ ok: r.ok, title: fullName(c), text: r.ok ? `Check-in făcut. Abonament valabil încă ${info.daysLeft} zile.` : r.message, clientId });
    setQ("");
  };

  const byCode = (raw: string) => {
    const id = raw.replace("SPARTAN:", "").trim().toUpperCase();
    const c = s.clients.find((x) => x.memberId === id);
    if (c) doCheck(c.id);
    else setResult({ ok: false, title: "Cod necunoscut", text: `Nu există niciun membru cu codul ${id}.` });
  };

  const pending = s.subscriptions.filter((x) => x.status === "în așteptare");
  const todays = s.sales.filter((x) => dayOf(x.at) === today()).sort((a, b) => b.at.localeCompare(a.at));
  const total = cart.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const add = (id: string) => {
    const p = s.products.find((x) => x.id === id)!;
    const inCart = cart.find((i) => i.refId === id)?.qty ?? 0;
    if (inCart >= p.stock) return toast("Nu mai e pe stoc", "error");
    setCart(cart.some((i) => i.refId === id) ? cart.map((i) => (i.refId === id ? { ...i, qty: i.qty + 1 } : i)) : [...cart, { kind: "product", refId: id, name: p.name, qty: 1, unitPrice: p.price }]);
  };

  const redeem = () => {
    const r = s.redemptions.find((x) => x.code === code.trim().toUpperCase().replace("SPARTAN-REWARD:", ""));
    if (!r) return toast("Cod inexistent", "error");
    if (r.status === "folosit") return toast("Codul a fost deja folosit", "error");
    s.useRedemption(r.id);
    const rw = s.rewards.find((x) => x.id === r.rewardId);
    const c = s.clients.find((x) => x.id === r.clientId);
    toast(`${rw?.name} pentru ${fullName(c)}. Cod marcat ca folosit.`);
    setCode("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 lg:gap-5">
      <div className="flex flex-col gap-4 lg:gap-5 min-w-0">
        <Panel title="Check-in">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-end">
              <Field label="Nume, telefon sau ID membru" prefix={<Search size={18} />} placeholder="ID sau nume" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && q.toUpperCase().startsWith("SG-") && byCode(q)} />
              <Button full={false} size="lg" variant="secondary" icon={<Camera size={19} />} aria-label="Scanează codul QR din poză" onClick={() => qrRef.current?.click()}>
                <span className="hidden sm:inline">Scanează</span>
              </Button>
            </div>
            <input
              ref={qrRef}
              type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")}
              accept="image/*"
              capture="environment"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const t = await decodeQrFromFile(f);
                if (t) byCode(t);
                else toast("Nu am putut citi codul QR din poză", "error");
              }}
            />
            {matches.length > 0 && (
              <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
                {matches.map((c) => {
                  const info = subInfo(s, c.id);
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-3 py-2">
                      <Avatar name={fullName(c)} photo={c.photo} size={36} id={c.id} />
                      <button type="button" onClick={() => setOpen(c.id)} className="flex-1 min-w-0 text-left">
                        <span className="block text-[15px] font-semibold text-text truncate">{fullName(c)}</span>
                        <span className="block text-[12px] text-muted">{c.memberId}</span>
                      </button>
                      {info.active ? <Badge tone="ok">{info.daysLeft} zile</Badge> : <Badge tone="danger">Expirat</Badge>}
                      <Button size="sm" full={false} onClick={() => doCheck(c.id)} disabled={!info.active}>
                        Check-in
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div key={result.title + result.text} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`rounded-2xl p-4 flex items-start gap-3 border ${result.ok ? "bg-ok-soft border-ok/30" : "bg-danger-soft border-danger/30"}`}>
                  {result.ok ? <CheckCircle2 size={26} className="text-ok shrink-0" /> : <XCircle size={26} className="text-danger shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-semibold text-text">{result.title}</div>
                    <div className="text-[14px] text-text mt-0.5">{result.text}</div>
                  </div>
                  {result.clientId && (
                    <Button size="sm" variant="secondary" full={false} onClick={() => setOpen(result.clientId!)}>
                      Fișa
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-[13px] text-muted inline-flex items-center gap-1.5">
              <ScanLine size={14} /> Scanează codul QR din aplicația clientului sau scrie ID-ul și apasă Enter.
            </p>
          </div>
        </Panel>

        <Panel title="Abonamente de încasat">
          {pending.length ? (
            <div className="flex flex-col divide-y divide-line">
              {pending.map((p) => {
                const c = s.clients.find((x) => x.id === p.clientId);
                const plan = s.plans.find((x) => x.id === p.planId);
                return (
                  <div key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Avatar name={fullName(c)} photo={c?.photo} size={36} id={p.clientId} />
                    <div className="flex-1 min-w-[140px]">
                      <div className="text-[15px] font-semibold text-text truncate">{fullName(c)}</div>
                      <div className="text-[12px] text-muted">
                        {plan?.name} · {lei(p.pricePaid)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" full={false} icon={<Banknote size={15} />} onClick={() => (s.confirmPending(p.id, "cash"), toast("Încasat cash"))}>
                        Cash
                      </Button>
                      <Button size="sm" full={false} variant="secondary" icon={<CreditCard size={15} />} onClick={() => (s.confirmPending(p.id, "card-pos"), toast("Încasat cu cardul"))}>
                        Card
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[14px] text-muted">Nimic de încasat. Abonamentele rezervate din aplicație apar aici.</p>
          )}
        </Panel>

        <Panel title="Cod de recompensă">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-end">
            <Field label="Codul clientului" prefix={<Ticket size={18} />} placeholder="ABC123" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            <Button full={false} size="lg" onClick={redeem}>
              Validează
            </Button>
          </div>
          <p className="text-[13px] text-muted mt-2">{s.redemptions.filter((r) => r.status === "activ").length} coduri active nefolosite.</p>
        </Panel>
      </div>

      <div className="flex flex-col gap-4 lg:gap-5 min-w-0">
        <Panel title="Vânzare la bar">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {s.products.map((p) => (
              <motion.button key={p.id} whileTap={{ scale: 0.95 }} disabled={p.stock === 0} onClick={() => add(p.id)} className="rounded-2xl bg-surface-2 border border-line p-3 text-left disabled:opacity-40 min-w-0">
                <span className="block text-[14px] font-semibold text-text leading-tight line-clamp-2 min-h-[2.5em]">{p.name}</span>
                <span className="flex items-center justify-between gap-1 mt-1.5">
                  <span className="text-[15px] font-bold text-volt tabular">{lei(p.price)}</span>
                  <span className={`text-[12px] tabular ${p.stock <= p.lowStock ? "text-warn" : "text-muted"}`}>{p.stock} buc</span>
                </span>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-line">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line">
              <ShoppingCart size={17} className="text-muted" />
              <span className="text-[15px] font-semibold text-text flex-1">Bon curent</span>
              {cart.length > 0 && (
                <button type="button" onClick={() => setCart([])} className="text-[13px] text-muted inline-flex items-center gap-1 h-8">
                  <Trash2 size={14} /> Golește
                </button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {cart.map((i) => (
                <motion.div key={i.refId} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 px-3 py-2 border-b border-line">
                  <span className="flex-1 min-w-0 text-[14px] text-text truncate">{i.name}</span>
                  <button type="button" aria-label="Scade" onClick={() => setCart(cart.flatMap((x) => (x.refId === i.refId ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x])))} className="w-8 h-8 rounded-lg bg-surface-2 grid place-items-center text-text">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-[14px] font-semibold text-text tabular">{i.qty}</span>
                  <button type="button" aria-label="Crește" onClick={() => add(i.refId!)} className="w-8 h-8 rounded-lg bg-surface-2 grid place-items-center text-text">
                    <Plus size={14} />
                  </button>
                  <span className="w-16 text-right text-[14px] font-semibold text-text tabular">{lei(i.qty * i.unitPrice)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {!cart.length && <p className="text-[14px] text-muted px-3 py-3">Atinge produsele de mai sus.</p>}
            <div className="p-3 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] text-muted">Total</span>
                <span className="font-display font-extrabold text-[26px] text-text tabular">{lei(total)}</span>
              </div>
              <Segmented
                value={method}
                onChange={setMethod}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "card-pos", label: "Card" },
                ]}
              />
              <Button
                disabled={!cart.length}
                onClick={() => {
                  s.addSale(cart, method);
                  toast(`Încasat ${lei(total)} ${method === "cash" ? "cash" : "cu cardul"}. Emite bonul din casa de marcat.`);
                  setCart([]);
                }}
              >
                Încasează {total ? lei(total) : ""}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title={`Vânzările de azi · ${lei(todays.reduce((a, x) => a + x.total, 0))}`}>
          <div className="flex flex-col divide-y divide-line max-h-[360px] overflow-y-auto">
            {todays.map((x) => (
              <div key={x.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                <span className="w-12 text-muted tabular shrink-0">{fmtTime(x.at)}</span>
                <span className="flex-1 min-w-0 text-text truncate">{x.items.map((i) => `${i.qty > 1 ? `${i.qty} × ` : ""}${i.name}`).join(", ")}</span>
                <span className="w-20 text-right font-semibold text-text tabular shrink-0">{lei(x.total)}</span>
              </div>
            ))}
            {!todays.length && <p className="text-[14px] text-muted py-2">Nicio vânzare azi.</p>}
          </div>
        </Panel>
      </div>

      <ClientDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}
