import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, ExternalLink, Eye, MapPin, Calendar, MessageCircle } from "lucide-react";
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
  { id: "recebido", label: "Recebido", color: "warning", emoji: "🟡" },
  { id: "enviado", label: "Enviado", color: "primary", emoji: "🟠" },
  { id: "agendado", label: "Agendado", color: "success", emoji: "🟢" },
  { id: "realizado", label: "Realizado", color: "info", emoji: "✅" },
] as const;

export function Kanban({ onNew }: { onNew?: () => void }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [finModal, setFinModal] = useState<Quote | null>(null);
  const [amount, setAmount] = useState(""); const [commission, setCommission] = useState("10");
  const [pmethod, setPmethod] = useState("pix"); const [pstatus, setPstatus] = useState("pendente");
  const [driver, setDriver] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setQuotes(data ?? []);
  };

  useEffect(() => {
    load();
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

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const cards = quotes.filter(q => q.status === col.id);
          return (
            <div key={col.id} className="rounded-2xl bg-card border border-border p-3 min-h-[300px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="font-display text-sm tracking-wider">{col.emoji} {col.label.toUpperCase()}</div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map(q => {
                  const ci = COLUMNS.findIndex(c => c.id === q.status);
                  return (
                    <div key={q.id} className="rounded-xl bg-muted/40 border border-border p-3 hover:border-primary/50 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm truncate">{q.client_name}</div>
                        <button onClick={() => setSelected(q)} className="text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{q.origin_city} → {q.destination_city}</div>
                      {q.desired_date && <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(q.desired_date + "T12:00"), "dd/MM/yy", { locale: ptBR })} {q.period}</div>}
                      <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded bg-gradient-brand-soft border border-primary/30 text-primary capitalize">{q.item_category}</div>
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
            <Button onClick={completeFinancial} className="w-full bg-gradient-brand text-background font-bold">Concluir e lançar</Button>
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
