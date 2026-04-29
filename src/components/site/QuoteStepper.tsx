import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MapPin, Package, Calendar as CalendarIcon, User, ArrowLeft, ArrowRight,
  Truck, Box, Sofa, Refrigerator, MoreHorizontal, Sun, CloudSun, Moon, Send,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WHATSAPP_NUMBER, SERVICE_CITIES } from "@/lib/config";

const CATEGORIES = [
  { id: "mudanca", label: "Mudança", Icon: Truck },
  { id: "caixas", label: "Caixas", Icon: Box },
  { id: "movel", label: "Móvel", Icon: Sofa },
  { id: "eletro", label: "Eletrodoméstico", Icon: Refrigerator },
  { id: "outro", label: "Outro", Icon: MoreHorizontal },
];

const PERIODS = [
  { id: "manha", label: "Manhã", Icon: Sun },
  { id: "tarde", label: "Tarde", Icon: CloudSun },
  { id: "noite", label: "Noite", Icon: Moon },
];

const STEPS = ["Origem & Destino", "Itens", "Detalhes", "Contato"];

type FormState = {
  originCity: string; originNeighborhood: string; originAddress: string;
  destCity: string; destNeighborhood: string; destAddress: string;
  category: string; quantity: string; itemNotes: string;
  date: Date | undefined; period: string; needsHelpers: boolean; technical: string;
  name: string; whatsapp: string;
};

const initial: FormState = {
  originCity: "", originNeighborhood: "", originAddress: "",
  destCity: "", destNeighborhood: "", destAddress: "",
  category: "", quantity: "", itemNotes: "",
  date: undefined, period: "", needsHelpers: false, technical: "",
  name: "", whatsapp: "",
};

export function QuoteStepper() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const canNext = () => {
    if (step === 0) return data.originCity && data.destCity;
    if (step === 1) return !!data.category;
    if (step === 2) return !!data.date && !!data.period;
    if (step === 3) return data.name.trim().length > 1 && data.whatsapp.replace(/\D/g, "").length >= 10;
    return false;
  };

  const submit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("quotes").insert({
        client_name: data.name,
        whatsapp: data.whatsapp,
        origin_city: data.originCity,
        origin_neighborhood: data.originNeighborhood || null,
        origin_address: data.originAddress || null,
        destination_city: data.destCity,
        destination_neighborhood: data.destNeighborhood || null,
        destination_address: data.destAddress || null,
        item_category: data.category,
        item_quantity: data.quantity || null,
        item_notes: data.itemNotes || null,
        desired_date: data.date ? format(data.date, "yyyy-MM-dd") : null,
        period: data.period,
        needs_helpers: data.needsHelpers,
        technical_details: data.technical || null,
        status: "recebido",
      });
      if (error) throw error;

      const msg = encodeURIComponent(
        `*🚚 NOVA COTAÇÃO — Central Fretes RS*\n\n` +
        `*👤 Cliente:* ${data.name}\n*📱 WhatsApp:* ${data.whatsapp}\n\n` +
        `*📍 Origem:* ${data.originCity}${data.originNeighborhood ? " — " + data.originNeighborhood : ""}${data.originAddress ? "\n   " + data.originAddress : ""}\n` +
        `*🎯 Destino:* ${data.destCity}${data.destNeighborhood ? " — " + data.destNeighborhood : ""}${data.destAddress ? "\n   " + data.destAddress : ""}\n\n` +
        `*📦 Item:* ${CATEGORIES.find(c => c.id === data.category)?.label}${data.quantity ? " (" + data.quantity + ")" : ""}\n` +
        (data.itemNotes ? `*📝 Obs item:* ${data.itemNotes}\n` : "") +
        `\n*📅 Data:* ${data.date ? format(data.date, "dd/MM/yyyy", { locale: ptBR }) : "-"}\n` +
        `*🕒 Período:* ${PERIODS.find(p => p.id === data.period)?.label}\n` +
        `*👷 Ajudantes:* ${data.needsHelpers ? "Sim (orçar separadamente)" : "Não"}\n` +
        (data.technical ? `*🔧 Detalhes:* ${data.technical}\n` : "")
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
      setDone(true);
      toast.success("Cotação enviada! Abrimos o WhatsApp para você.");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center shadow-card">
        <CheckCircle2 className="w-16 h-16 mx-auto text-success mb-4" />
        <h3 className="font-display text-2xl mb-2">Cotação enviada!</h3>
        <p className="text-muted-foreground mb-6">
          Em instantes você recebe o valor pelo WhatsApp. Caso o WhatsApp não tenha aberto, clique abaixo.
        </p>
        <Button
          className="bg-gradient-brand text-background font-bold"
          onClick={() => { setDone(false); setData(initial); setStep(0); }}
        >
          Nova cotação
        </Button>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-7 shadow-card">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-display text-xs tracking-widest text-muted-foreground">
            ETAPA {step + 1} DE {STEPS.length}
          </div>
          <div className="font-display text-sm text-primary font-bold">{STEPS[step]}</div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-brand transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 0: Origin/Destination */}
      {step === 0 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2"><MapPin className="text-primary" /> Origem & Destino</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { k: "origin", title: "Origem", color: "warning" as const,
                cityKey: "originCity", nKey: "originNeighborhood", aKey: "originAddress" },
              { k: "dest", title: "Destino", color: "primary" as const,
                cityKey: "destCity", nKey: "destNeighborhood", aKey: "destAddress" },
            ].map((b) => (
              <div key={b.k} className="stepper-block stepper-field rounded-xl bg-muted/40 p-4 space-y-3">
                <div className="font-display text-sm tracking-widest text-primary">{b.title.toUpperCase()}</div>
                <div>
                  <Label className="text-xs">Cidade *</Label>
                  <Select value={data[b.cityKey as keyof FormState] as string}
                    onValueChange={(v) => update(b.cityKey as keyof FormState, v as never)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Bairro</Label>
                  <Input className="mt-1" value={data[b.nKey as keyof FormState] as string}
                    onChange={(e) => update(b.nKey as keyof FormState, e.target.value as never)} />
                </div>
                <div>
                  <Label className="text-xs">Endereço / referência</Label>
                  <Input className="mt-1" value={data[b.aKey as keyof FormState] as string}
                    onChange={(e) => update(b.aKey as keyof FormState, e.target.value as never)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Items */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2"><Package className="text-primary" /> O que vamos transportar?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CATEGORIES.map(({ id, label, Icon }) => (
              <button key={id} type="button" onClick={() => update("category", id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  data.category === id
                    ? "border-primary bg-gradient-brand-soft shadow-glow"
                    : "border-border bg-muted/30 hover:border-primary/50"
                )}>
                <Icon className={cn("w-7 h-7", data.category === id ? "text-primary" : "text-foreground")} />
                <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Quantidade aproximada</Label>
              <Input className="mt-1" placeholder="Ex: 5 caixas, 1 sofá..." value={data.quantity}
                onChange={(e) => update("quantity", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Observação rápida</Label>
              <Input className="mt-1" placeholder="Algo que devamos saber" value={data.itemNotes}
                onChange={(e) => update("itemNotes", e.target.value)} />
            </div>
          </div>

          <Alert>
            ⚠️ Materiais de construção a granel (cimento, areia, brita) <b>não são aceitos</b>. Exceção apenas para itens embalados em caixas fechadas.
          </Alert>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2"><CalendarIcon className="text-primary" /> Quando?</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs">Data desejada *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full mt-1 justify-start", !data.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.date ? format(data.date, "PPP", { locale: ptBR }) : "Escolha a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={data.date} onSelect={(d) => update("date", d)}
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                    initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Período *</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {PERIODS.map(({ id, label, Icon }) => (
                  <button key={id} type="button" onClick={() => update("period", id)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-all",
                      data.period === id
                        ? "border-primary bg-gradient-brand-soft"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    )}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border cursor-pointer">
            <Checkbox checked={data.needsHelpers} onCheckedChange={(v) => update("needsHelpers", !!v)} className="mt-0.5" />
            <div>
              <div className="font-bold text-sm">Preciso de ajudantes</div>
              <div className="text-xs text-muted-foreground">O motorista não realiza carga/descarga. Será orçado separadamente.</div>
            </div>
          </label>
          <div>
            <Label className="text-xs">Detalhes técnicos (andar, elevador, peso, distâncias)</Label>
            <Textarea className="mt-1" rows={3} value={data.technical} onChange={(e) => update("technical", e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2"><User className="text-primary" /> Seu contato</h3>
          <div>
            <Label className="text-xs">Nome *</Label>
            <Input className="mt-1" value={data.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">WhatsApp *</Label>
            <Input className="mt-1" placeholder="(51) 99999-9999" value={data.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)} />
          </div>
          <Alert>
            ⚠️ Quanto mais preciso você for, mais precisa será sua cotação. Informações incorretas podem exigir um novo orçamento ou impedir a execução do frete.
          </Alert>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button className="bg-gradient-brand text-background font-bold shadow-glow disabled:opacity-50"
            disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
            Próximo <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button className="bg-gradient-brand text-background font-bold shadow-glow disabled:opacity-50"
            disabled={!canNext() || submitting} onClick={submit}>
            <Send className="w-4 h-4 mr-2" /> {submitting ? "Enviando..." : "SOLICITAR COTAÇÃO"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning-foreground/90">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-warning mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
