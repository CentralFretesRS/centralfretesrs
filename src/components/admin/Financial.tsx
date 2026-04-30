import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type Fin = {
  id: string; client_name: string; origin: string | null; destination: string | null;
  driver: string | null; amount: number; commission_pct: number;
  payment_method: string; payment_status: string; realized_at: string;
};

export function Financial() {
  const [rows, setRows] = useState<Fin[]>([]);
  const today = new Date();
  const [from, setFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
  const [groupBy, setGroupBy] = useState<"date" | "origin" | "destination" | "driver" | "client">("date");

  const load = async () => {
    const { data, error } = await supabase.from("financials").select("*")
      .gte("realized_at", from).lte("realized_at", to).order("realized_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, [from, to]);

  const totals = useMemo(() => {
    const gross = rows.reduce((s, r) => s + Number(r.amount), 0);
    const commission = rows.reduce((s, r) => s + Number(r.amount) * Number(r.commission_pct) / 100, 0);
    const paid = rows.filter(r => r.payment_status === "pago").reduce((s, r) => s + Number(r.amount), 0);
    const pending = gross - paid;
    return { gross, commission, paid, pending };
  }, [rows]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach(r => {
      const key = groupBy === "date" ? format(parseISO(r.realized_at), "dd/MM")
        : (r as any)[groupBy === "client" ? "client_name" : groupBy] ?? "—";
      map.set(key, (map.get(key) ?? 0) + Number(r.amount));
    });
    return Array.from(map, ([name, value]) => ({ name, value })).slice(0, 20);
  }, [rows, groupBy]);

  const togglePaid = async (r: Fin) => {
    const next = r.payment_status === "pago" ? "pendente" : "pago";
    const { error } = await supabase.from("financials").update({ payment_status: next }).eq("id", r.id);
    if (error) toast.error(error.message); else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir lançamento?")) return;
    const { error } = await supabase.from("financials").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card className="p-4 flex flex-wrap items-end gap-3">
        <div><Label className="text-xs">De</Label><Input type="date" className="mt-1" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label className="text-xs">Até</Label><Input type="date" className="mt-1" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="min-w-[160px]"><Label className="text-xs">Agrupar por</Label>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="origin">Origem</SelectItem>
              <SelectItem value="destination">Destino</SelectItem>
              <SelectItem value="driver">Motorista</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="💰 Bruto" v={totals.gross} accent="primary" />
        <Stat label="👨‍💼 Comissões" v={totals.commission} accent="warning" />
        <Stat label="🔵 Recebido" v={totals.paid} accent="info" />
        <Stat label="🟡 Pendente" v={totals.pending} accent="warning" />
      </div>

      {/* Chart */}
      <Card className="p-4">
        <div className="font-display text-sm tracking-wider mb-3">RECEITA POR {groupBy.toUpperCase()}</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 60)" />
            <XAxis dataKey="name" stroke="oklch(0.68 0.02 80)" fontSize={11} />
            <YAxis stroke="oklch(0.68 0.02 80)" fontSize={11} />
            <Tooltip contentStyle={{ background: "#000000", border: "1px solid #FF8C00", borderRadius: 12 }} />
            <Bar dataKey="value" fill="oklch(0.74 0.18 55)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground tracking-wider">
            <tr><th className="text-left p-2">Data</th><th className="text-left p-2">Cliente</th><th className="text-left p-2">Trecho</th><th className="text-left p-2">Motorista</th><th className="text-right p-2">Valor</th><th className="text-right p-2">Comissão</th><th className="text-left p-2">Pagto</th><th className="text-left p-2">Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-border/50">
                <td className="p-2">{format(parseISO(r.realized_at), "dd/MM/yyyy", { locale: ptBR })}</td>
                <td className="p-2 font-medium">{r.client_name}</td>
                <td className="p-2 text-muted-foreground">{r.origin} → {r.destination}</td>
                <td className="p-2 text-muted-foreground">{r.driver ?? "—"}</td>
                <td className="p-2 text-right font-bold">R$ {Number(r.amount).toFixed(2)}</td>
                <td className="p-2 text-right text-muted-foreground">R$ {(Number(r.amount) * Number(r.commission_pct) / 100).toFixed(2)}</td>
                <td className="p-2 capitalize">{r.payment_method}</td>
                <td className="p-2">
                  <button onClick={() => togglePaid(r)}>
                    <Badge className={r.payment_status === "pago" ? "bg-info text-info-foreground" : "bg-warning text-warning-foreground"}>{r.payment_status}</Badge>
                  </button>
                </td>
                <td className="p-2 text-right"><button onClick={() => remove(r.id)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">Nenhum lançamento no período</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Stat({ label, v, accent }: { label: string; v: number; accent: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`font-display text-2xl mt-1 text-${accent}`}>R$ {v.toFixed(2)}</div>
    </Card>
  );
}
