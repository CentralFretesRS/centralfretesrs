import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, ExternalLink, Eye, MapPin, Calendar, MessageCircle, Filter, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { WHATSAPP_NUMBER } from "@/lib/config";
import { cn } from "@/lib/utils";

type Quote = {
  id: string; client_name: string; whatsapp: string;
  origin_city: string; origin_neighborhood: string | null; origin_address: string | null;
  destination_city: string; destination_neighborhood: string | null; destination_address: string | null;
  item_category: string; item_quantity: string | null; item_notes: string | null;
  desired_date: string | null; period: string | null; needs_helpers: boolean | null;
  technical_details: string | null; status: string; created_at: string;
};

const COLUMNS = [
  { id: "recebido", label: "Recebido", accent: "warning", emoji: "🟡", border: "border-warning/60", bg: "bg-background", chip: "bg-background text-warning" },
  { id: "enviado", label: "Respondido", accent: "primary", emoji: "🟠", border: "border-primary/60", bg: "bg-background", chip: "bg-background text-primary" },
  { id: "agendado", label: "Agendado", accent: "info", emoji: "🔵", border: "border-info/60", bg: "bg-background", chip: "bg-background text-info" },
  { id: "realizado", label: "Realizado", accent: "success", emoji: "🟢", border: "border-success/60", bg: "bg-background", chip: "bg-background text-success" },
] as const;

export function Kanban({ onNew }: { onNew?: () => void }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [finModal, setFinModal] = useState<Quote | null>(null);
  const [amount, setAmount] = useState(""); const [commission, setCommission] = useState("10");
  const [pmethod, setPmethod] = useState("pix"); const [pstatus, setPstatus] = useState("pendente");
  const [driver, setDriver] = useState("");

  // Filters
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [fOrigin, setFOrigin] = useState("");
  const [fDestination, setFDestination] = useState("");
  const [fDriver, setFDriver] = useState("");
  const [drivers, setDrivers] = useState<string[]>([]);

  const load = async () => {
    const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setQuotes(data ?? []);
  };

  useEffect(() => {
    load();
    // load distinct drivers from financials for the filter
    supabase.from("financials").select("driver").then(({ data }) => {
      const list = Array.from(new Set((data ?? []).map((r: any) => r.driver).filter(Boolean))) as string[];
      setDrivers(list);
    });
    const ch = supabase.channel("quotes-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, (payload) => {
        load();
        if (payload.eventType === "INSERT") {
          onNew?.();
          toast.success("🔔 Nova cotação recebida!");
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Central Fretes RS", { body: "Nova cotação recebida!" });
          }
        }
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [onNew]);

  const filtered = useMemo(() => {
    return quotes.filter(q => {
      if (fFrom && q.created_at < fFrom) return false;
      if (fTo && q.created_at > fTo + "T23:59:59") return false;
      if (fOrigin && !q.origin_city.toLowerCase().includes(fOrigin.toLowerCase())) return false;
      if (fDestination && !q.destination_city.toLowerCase().includes(fDestination.toLowerCase())) return false;
      // driver filter only relevant for items linked to financials; we keep simple substring on technical_details fallback
      if (fDriver) {
        const hay = ((q.technical_details ?? "") + " " + (q.item_notes ?? "")).toLowerCase();
        if (!hay.includes(fDriver.toLowerCase())) return false;
      }
      return true;
    });
  }, [quotes, fFrom, fTo, fOrigin, fDestination, fDriver]);

  const clearFilters = () => { setFFrom(""); setFTo(""); setFOrigin(""); setFDestination(""); setFDriver(""); };
  const hasFilters = !!(fFrom || fTo || fOrigin || fDestination || fDriver);

  const move = async (q: Quote, dir: 1 | -1) => {
    const idx = COLUMNS.findIndex(c => c.id === q.status);
    const next = COLUMNS[idx + dir];
    if (!next) return;
    if (next.id === "realizado") { setFinModal(q); return; }
    const { error } = await supabase.from("quotes").update({ status: next.id }).eq("id", q.id);
    if (error) toast.error(error.message);
  };

  const completeFinancial = async () => {
    if (!finModal) return;
    const amt = parseFloat(amount); if (isNaN(amt) || amt <= 0) { toast.error("Valor inválido"); return; }
    const { error: e1 } = await supabase.from("quotes").update({ status: "realizado" }).eq("id", finModal.id);
    const { error: e2 } = await supabase.from("financials").insert({
      quote_id: finModal.id, client_name: finModal.client_name,
      origin: finModal.origin_city, destination: finModal.destination_city,
      driver: driver || null, amount: amt, commission_pct: parseFloat(commission) || 10,
      payment_method: pmethod, payment_status: pstatus,
    });
    if (e1 || e2) { toast.error((e1 || e2)?.message ?? "Erro"); return; }
    toast.success("Lançamento financeiro criado");
    setFinModal(null); setAmount(""); setCommission("10"); setDriver(""); setPmethod("pix"); setPstatus("pendente");
  };

  const removeQuote = async (q: Quote) => {
    if (!confirm("Tem certeza que deseja apagar este orçamento?")) return;
    const { error } = await supabase.from("quotes").delete().eq("id", q.id);
    if (error) toast.error(error.message);
    else toast.success("Orçamento apagado");
  };

  return (
    <div>
      {/* Filters */}
      <div className="rounded-2xl border border-border bg-background p-3 mb-4 flex flex-wrap items-end gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wider mr-1"><Filter className="w-3.5 h-3.5" /> Filtros</div>
        <div><Label className="text-[10px]">De</Label><Input type="date" className="mt-1 h-8 text-xs w-[140px]" value={fFrom} onChange={(e) => setFFrom(e.target.value)} /></div>
        <div><Label className="text-[10px]">Até</Label><Input type="date" className="mt-1 h-8 text-xs w-[140px]" value={fTo} onChange={(e) => setFTo(e.target.value)} /></div>
        <div><Label className="text-[10px]">Origem</Label><Input className="mt-1 h-8 text-xs w-[140px]" placeholder="Cidade" value={fOrigin} onChange={(e) => setFOrigin(e.target.value)} /></div>
        <div><Label className="text-[10px]">Destino</Label><Input className="mt-1 h-8 text-xs w-[140px]" placeholder="Cidade" value={fDestination} onChange={(e) => setFDestination(e.target.value)} /></div>
        <div><Label className="text-[10px]">Motorista</Label>
          {drivers.length > 0 ? (
            <Select value={fDriver || "all"} onValueChange={(v) => setFDriver(v === "all" ? "" : v)}>
              <SelectTrigger className="mt-1 h-8 text-xs w-[140px]"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {drivers.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input className="mt-1 h-8 text-xs w-[140px]" placeholder="Nome" value={fDriver} onChange={(e) => setFDriver(e.target.value)} />
          )}
        </div>
        {hasFilters && (
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={clearFilters}><X className="w-3 h-3 mr-1" />Limpar</Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const cards = filtered.filter(q => q.status === col.id);
          return (
            <div key={col.id} className={cn("rounded-2xl border-2 p-3 min-h-[300px]", col.border, col.bg)}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="font-display text-sm tracking-wider">{col.emoji} {col.label.toUpperCase()}</div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold", col.chip)}>{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map(q => {
                  const ci = COLUMNS.findIndex(c => c.id === q.status);
                  return (
                    <div key={q.id} className={cn("rounded-xl bg-card border p-3 hover:brightness-110 transition", col.border)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] text-muted-foreground font-mono">#{q.id.slice(0, 8)}</div>
                          <div className="font-bold text-sm truncate">{q.client_name}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => setSelected(q)} className="text-muted-foreground hover:text-primary" title="Ver detalhes"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => removeQuote(q)} className="text-muted-foreground hover:text-destructive" title="Apagar orçamento"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{q.origin_city} → {q.destination_city}</div>
                      {q.desired_date && <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(q.desired_date + "T12:00"), "dd/MM/yy", { locale: ptBR })} {q.period}</div>}
                      <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded bg-background border border-primary/30 text-primary capitalize">{q.item_category}{q.item_quantity ? ` · ${q.item_quantity}` : ""}</div>
                      {q.item_notes && <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2 italic">"{q.item_notes}"</div>}
                      <div className="flex items-center justify-between gap-1 mt-3">
                        <Button size="sm" variant="ghost" disabled={ci === 0} onClick={() => move(q, -1)} className="h-7 px-2"><ChevronLeft className="w-3 h-3" /></Button>
                        <a href={`https://wa.me/${q.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-success hover:underline"><MessageCircle className="w-3 h-3" />WhatsApp</a>
                        <Button size="sm" variant="ghost" disabled={ci === COLUMNS.length - 1} onClick={() => move(q, 1)} className="h-7 px-2"><ChevronRight className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && <div className="text-xs text-muted-foreground text-center py-6">Sem cards</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalhes da cotação</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Field label="Cliente" v={selected.client_name} />
              <Field label="WhatsApp" v={<a className="text-success underline" href={`https://wa.me/${selected.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{selected.whatsapp} <ExternalLink className="inline w-3 h-3" /></a>} />
              <Field label="Origem" v={`${selected.origin_city}${selected.origin_neighborhood ? " — " + selected.origin_neighborhood : ""}${selected.origin_address ? " · " + selected.origin_address : ""}`} />
              <Field label="Destino" v={`${selected.destination_city}${selected.destination_neighborhood ? " — " + selected.destination_neighborhood : ""}${selected.destination_address ? " · " + selected.destination_address : ""}`} />
              <Field label="Item" v={`${selected.item_category}${selected.item_quantity ? " (" + selected.item_quantity + ")" : ""}`} />
              {selected.item_notes && <Field label="Obs item" v={selected.item_notes} />}
              <Field label="Data" v={selected.desired_date ? format(new Date(selected.desired_date + "T12:00"), "dd/MM/yyyy") + " · " + (selected.period ?? "") : "—"} />
              <Field label="Ajudantes" v={selected.needs_helpers ? "Sim" : "Não"} />
              {selected.technical_details && <Field label="Detalhes" v={selected.technical_details} />}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Financial entry */}
      <Dialog open={!!finModal} onOpenChange={(o) => !o && setFinModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Concluir frete — {finModal?.client_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Valor (R$) *</Label><Input className="mt-1" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <div><Label className="text-xs">Comissão (%)</Label><Input className="mt-1" type="number" value={commission} onChange={(e) => setCommission(e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">Motorista</Label><Input className="mt-1" value={driver} onChange={(e) => setDriver(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Pagamento</Label>
                <Select value={pmethod} onValueChange={setPmethod}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pix">Pix</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Status</Label>
                <Select value={pstatus} onValueChange={setPstatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pago">Pago</SelectItem><SelectItem value="pendente">Pendente</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={completeFinancial} className="w-full bg-gradient-brand text-white font-bold">Concluir e lançar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/60">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={cn("col-span-2 text-sm")}>{v}</div>
    </div>
  );
}
