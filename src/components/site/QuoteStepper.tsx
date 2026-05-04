import { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MapPin, Package, Calendar as CalendarIcon, User, ArrowLeft, ArrowRight,
  Sun, CloudSun, Shuffle, Send, AlertTriangle, CheckCircle2,
  Sofa, Armchair, Tv, Refrigerator, Microwave, Bed, Shirt, Flame,
  Wind, WashingMachine, Flower2, TreePine, Briefcase, Monitor, Printer,
  Server, Box, Bike, MoreHorizontal, Plus, Minus, Trash2,
  UtensilsCrossed, LampDesk, BookOpen, Coffee, ChefHat, Square,
  Building2, Boxes, ScrollText,
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

// ---------- Categories & Items ----------
type ItemDef = { id: string; label: string; Icon: any };
type TabDef = { id: string; label: string; Icon: any; items: ItemDef[] };

const TABS: TabDef[] = [
  {
    id: "sala", label: "Sala", Icon: Sofa,
    items: [
      { id: "sofa-2", label: "Sofá 2 lugares", Icon: Sofa },
      { id: "sofa-3", label: "Sofá 3 lugares", Icon: Sofa },
      { id: "poltrona", label: "Poltrona", Icon: Armchair },
      { id: "rack", label: "Rack", Icon: Tv },
      { id: "estante", label: "Estante", Icon: BookOpen },
      { id: "mesa-centro", label: "Mesa de centro", Icon: Square },
      { id: "tapete", label: "Tapete", Icon: Square },
    ],
  },
  {
    id: "cozinha", label: "Cozinha", Icon: ChefHat,
    items: [
      { id: "geladeira", label: "Geladeira", Icon: Refrigerator },
      { id: "fogao", label: "Fogão", Icon: Flame },
      { id: "microondas", label: "Micro-ondas", Icon: Microwave },
      { id: "armario-cozinha", label: "Armário de cozinha", Icon: Boxes },
      { id: "paneleiro", label: "Paneleiro", Icon: Coffee },
      { id: "mesa-jantar", label: "Mesa de jantar", Icon: UtensilsCrossed },
      { id: "cadeiras", label: "Cadeiras", Icon: Armchair },
    ],
  },
  {
    id: "quarto", label: "Quarto", Icon: Bed,
    items: [
      { id: "cama-solteiro", label: "Cama solteiro", Icon: Bed },
      { id: "cama-casal", label: "Cama casal", Icon: Bed },
      { id: "colchao-solteiro", label: "Colchão solteiro", Icon: Bed },
      { id: "colchao-casal", label: "Colchão casal", Icon: Bed },
      { id: "guarda-roupa", label: "Guarda-roupa", Icon: Shirt },
      { id: "comoda", label: "Cômoda", Icon: Boxes },
      { id: "criado-mudo", label: "Criado-mudo", Icon: LampDesk },
    ],
  },
  {
    id: "eletronicos", label: "Eletrônicos", Icon: Tv,
    items: [
      { id: "tv", label: "TV", Icon: Tv },
      { id: "maq-lavar", label: "Máquina de lavar", Icon: WashingMachine },
      { id: "secadora", label: "Secadora", Icon: WashingMachine },
      { id: "ar-cond", label: "Ar condicionado", Icon: Wind },
    ],
  },
  {
    id: "jardim", label: "Plantas & Jardim", Icon: TreePine,
    items: [
      { id: "planta-pq", label: "Planta pequena", Icon: Flower2 },
      { id: "planta-md", label: "Planta média", Icon: TreePine },
      { id: "vaso", label: "Vaso decorativo", Icon: Flower2 },
      { id: "mob-jardim", label: "Mobília de jardim", Icon: Armchair },
      { id: "churrasq", label: "Churrasqueira", Icon: Flame },
      { id: "outros-jardim", label: "Outros jardim", Icon: MoreHorizontal },
    ],
  },
  {
    id: "escritorio", label: "Escritório", Icon: Briefcase,
    items: [
      { id: "mesa-esc", label: "Mesa de escritório", Icon: LampDesk },
      { id: "cad-esc", label: "Cadeira de escritório", Icon: Armchair },
      { id: "arm-esc", label: "Armário de escritório", Icon: Boxes },
      { id: "estante-arq", label: "Estante/Arquivo", Icon: BookOpen },
      { id: "computador", label: "Computador/Monitor", Icon: Monitor },
      { id: "impressora", label: "Impressora", Icon: Printer },
      { id: "servidor", label: "Servidor/Rack TI", Icon: Server },
      { id: "balcao", label: "Balcão", Icon: Building2 },
      { id: "prateleiras", label: "Prateleiras", Icon: BookOpen },
    ],
  },
  {
    id: "outros", label: "Outros", Icon: Box,
    items: [
      { id: "caixas", label: "Caixas", Icon: Box },
      { id: "bicicleta", label: "Bicicleta", Icon: Bike },
      { id: "moto", label: "Moto", Icon: Bike },
      { id: "outros-livre", label: "Outros (descrever)", Icon: MoreHorizontal },
    ],
  },
];

const ALL_ITEMS: Record<string, string> = TABS.flatMap(t => t.items).reduce(
  (acc, i) => ({ ...acc, [i.id]: i.label }), {}
);

const PERIODS = [
  { id: "manha", label: "Manhã", Icon: Sun },
  { id: "tarde", label: "Tarde", Icon: CloudSun },
  { id: "indiferente", label: "Indiferente", Icon: Shuffle },
];

const CONDITIONS = [
  { id: "fragil", label: "Itens frágeis" },
  { id: "desmontar", label: "Precisa desmontar/montar" },
  { id: "sem-vaga", label: "Sem vaga para caminhão" },
  { id: "outros-cond", label: "Outros" },
];

const STEPS = ["Origem & Destino", "Itens", "Detalhes", "Contato"];

type FormState = {
  originCity: string; originNeighborhood: string;
  originPropertyType: "" | "casa" | "apartamento";
  originFloor: string;
  originHasElevator: "" | "sim" | "nao";
  destCity: string; destNeighborhood: string;
  destPropertyType: "" | "casa" | "apartamento";
  destFloor: string;
  destHasElevator: "" | "sim" | "nao";
  items: Record<string, number>;
  itemsOtherText: string;
  date: Date | undefined; period: string;
  needsHelpers: boolean;
  conditions: string[];
  conditionsOtherText: string;
  observations: string;
  name: string; whatsapp: string;
};

const initial: FormState = {
  originCity: "", originNeighborhood: "",
  originPropertyType: "", originFloor: "", originHasElevator: "",
  destCity: "", destNeighborhood: "",
  destPropertyType: "", destFloor: "", destHasElevator: "",
  items: {}, itemsOtherText: "",
  date: undefined, period: "",
  needsHelpers: false,
  conditions: [], conditionsOtherText: "",
  observations: "",
  name: "", whatsapp: "",
};

// ---------- Neighborhood Autocomplete (OpenStreetMap Nominatim) ----------
function NeighborhoodAutocomplete({
  value, onChange, city,
}: { value: string; onChange: (v: string) => void; city: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!value || value.trim().length < 2 || !city) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setLoading(true);
        const q = encodeURIComponent(`${value}, ${city}, Rio Grande do Sul, Brasil`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&countrycodes=br&q=${q}`;
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { "Accept-Language": "pt-BR" },
        });
        const data = await res.json();
        const set = new Set<string>();
        for (const item of data || []) {
          const a = item.address || {};
          // Apenas resultados no RS
          if (a.state && !/rio grande do sul/i.test(a.state)) continue;
          // Filtrar pela cidade selecionada
          const cityName = a.city || a.town || a.village || a.municipality || "";
          if (city && cityName && !cityName.toLowerCase().includes(city.toLowerCase())) continue;
          const n = a.suburb || a.neighbourhood || a.quarter || a.city_district || a.residential;
          if (n) set.add(n);
        }
        setSuggestions(Array.from(set).slice(0, 6));
        setOpen(true);
      } catch (e: any) {
        if (e?.name !== "AbortError") setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value, city]);

  return (
    <div className="relative">
      <Input
        className="mt-1 neighborhood-input"
        value={value}
        placeholder="Digite o bairro"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => suggestions.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-white/30 bg-popover shadow-lg overflow-hidden">
          {loading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Buscando…</div>
          )}
          {!loading && suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground no-orange-border"
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setOpen(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuoteStepper() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initial);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const updateCity = (cityKey: "originCity" | "destCity", neighborhoodKey: "originNeighborhood" | "destNeighborhood", value: string) => {
    setData((d) => ({
      ...d,
      [cityKey]: value,
      [neighborhoodKey]: d[cityKey] === value ? d[neighborhoodKey] : "",
    }));
  };

  const setItemQty = (id: string, qty: number) => {
    setData((d) => {
      const next = { ...d.items };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return { ...d, items: next };
    });
  };

  const incItem = (id: string) => setItemQty(id, (data.items[id] || 0) + 1);
  const decItem = (id: string) => setItemQty(id, (data.items[id] || 0) - 1);

  const toggleCondition = (id: string) => {
    setData((d) => ({
      ...d,
      conditions: d.conditions.includes(id)
        ? d.conditions.filter(c => c !== id)
        : [...d.conditions, id],
    }));
  };

  const itemsCount = useMemo(
    () => Object.values(data.items).reduce((s, n) => s + n, 0),
    [data.items]
  );

  const canNext = () => {
    if (step === 0) {
      if (!data.originCity || !data.destCity) return false;
      if (data.originPropertyType === "apartamento" && !data.originFloor) return false;
      if (data.destPropertyType === "apartamento" && !data.destFloor) return false;
      return true;
    }
    if (step === 1) return itemsCount > 0;
    if (step === 2) return !!data.date && !!data.period;
    if (step === 3) return data.name.trim().length > 1 && data.whatsapp.replace(/\D/g, "").length >= 10;
    return false;
  };

  const tryNext = () => {
    if (!canNext()) { setAttempted(true); return; }
    setAttempted(false);
    setStep((s) => s + 1);
  };

  const itemsListText = () => {
    const lines = Object.entries(data.items).map(([id, qty]) => {
      if (id === "outros-livre" && data.itemsOtherText)
        return `• ${qty}x ${ALL_ITEMS[id]}: ${data.itemsOtherText}`;
      return `• ${qty}x ${ALL_ITEMS[id] || id}`;
    });
    return lines.join("\n");
  };

  const conditionsText = () => {
    const lines = data.conditions.map(c => {
      if (c === "outros-cond" && data.conditionsOtherText)
        return `• Outros: ${data.conditionsOtherText}`;
      return `• ${CONDITIONS.find(x => x.id === c)?.label}`;
    });
    return lines.join("\n");
  };

  const submit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      // Build a category summary for DB compatibility
      const firstCat = Object.keys(data.items)[0] || "outros";
      const itemsSummary = Object.entries(data.items)
        .map(([id, q]) => `${q}x ${ALL_ITEMS[id] || id}`)
        .join("; ");

      const { error } = await supabase.from("quotes").insert({
        client_name: data.name,
        whatsapp: data.whatsapp,
        origin_city: data.originCity,
        origin_neighborhood: data.originNeighborhood || null,
        origin_address: null,
        destination_city: data.destCity,
        destination_neighborhood: data.destNeighborhood || null,
        destination_address: null,
        item_category: firstCat,
        item_quantity: String(itemsCount),
        item_notes: itemsSummary + (data.itemsOtherText ? ` | Outros: ${data.itemsOtherText}` : ""),
        desired_date: data.date ? format(data.date, "yyyy-MM-dd") : null,
        period: data.period,
        needs_helpers: data.needsHelpers,
        technical_details: [
          conditionsText(),
          data.observations ? `Obs: ${data.observations}` : "",
        ].filter(Boolean).join("\n") || null,
        status: "recebido",
      });
      if (error) throw error;

      const msg = encodeURIComponent(
        `*🚚 NOVA COTAÇÃO — Central Fretes RS*\n\n` +
        `*👤 Cliente:* ${data.name}\n*📱 WhatsApp:* ${data.whatsapp}\n\n` +
        `*📍 Origem:* ${data.originCity}${data.originNeighborhood ? " — " + data.originNeighborhood : ""}\n` +
        `*🎯 Destino:* ${data.destCity}${data.destNeighborhood ? " — " + data.destNeighborhood : ""}\n\n` +
        `*📦 Itens (${itemsCount}):*\n${itemsListText()}\n\n` +
        `*📅 Data:* ${data.date ? format(data.date, "dd/MM/yyyy", { locale: ptBR }) : "-"}\n` +
        `*🕒 Período:* ${PERIODS.find(p => p.id === data.period)?.label}\n` +
        `*👷 Ajudantes:* ${data.needsHelpers ? "Sim (orçar separadamente)" : "Não"}\n` +
        (data.conditions.length ? `\n*🏠 Condições do local:*\n${conditionsText()}\n` : "") +
        (data.observations ? `\n*📝 Observações:* ${data.observations}\n` : "")
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
          Em instantes você recebe o valor pelo WhatsApp.
        </p>
        <Button
          className="bg-gradient-brand text-white font-bold"
          onClick={() => { setDone(false); setData(initial); setStep(0); setActiveTab(TABS[0].id); }}
        >
          Nova cotação
        </Button>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-7 shadow-card overflow-hidden w-full max-w-full min-w-0">
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

      {/* Step 0 */}
      {step === 0 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2"><MapPin className="text-primary" /> Origem & Destino</h3>
          <div className="grid sm:grid-cols-2 gap-5">
              {[
                { k: "origin", title: "Origem", cityKey: "originCity", nKey: "originNeighborhood" },
                { k: "dest", title: "Destino", cityKey: "destCity", nKey: "destNeighborhood" },
            ].map((b) => {
              const cityKey = b.cityKey as "originCity" | "destCity";
              const neighborhoodKey = b.nKey as "originNeighborhood" | "destNeighborhood";
              const selectedCity = data[cityKey];
              const hasCity = !!selectedCity;
              return (
              <div key={b.k} className="stepper-block rounded-xl bg-background p-4 space-y-3">
                <div className="font-display text-sm tracking-widest text-primary">{b.title.toUpperCase()}</div>
                <div>
                  <Label className="text-xs">Cidade *</Label>
                  <div className="relative mt-1">
                    <select
                      value={selectedCity}
                      onChange={(e) => updateCity(cityKey, neighborhoodKey, e.currentTarget.value)}
                      onInput={(e) => updateCity(cityKey, neighborhoodKey, e.currentTarget.value)}
                      onBlur={(e) => updateCity(cityKey, neighborhoodKey, e.currentTarget.value)}
                      className={cn(
                        "w-full appearance-none rounded-lg px-4 py-3 text-base font-semibold bg-background text-foreground cursor-pointer transition-all duration-150 focus:outline-none",
                        "border-2 no-orange-border",
                        hasCity
                          ? "border-primary text-primary shadow-[0_4px_0_0_#FF8C00,0_6px_12px_-2px_rgba(255,140,0,0.5)] -translate-y-[2px]"
                          : "border-white/40 shadow-[0_3px_0_0_rgba(255,255,255,0.2)]"
                      )}
                      style={{ WebkitAppearance: "none", MozAppearance: "none" }}
                    >
                      <option value="" disabled>Selecione a cidade</option>
                      {SERVICE_CITIES.map(c => (
                        <option key={c} value={c} style={{ background: "#000", color: "#fff" }}>{c}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                      {hasCity ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-4 h-4 rotate-90" />}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Bairro</Label>
                  <NeighborhoodAutocomplete
                    value={data[neighborhoodKey]}
                    city={selectedCity}
                    onChange={(v) => update(neighborhoodKey, v)}
                  />
                </div>
                {(() => {
                  const propKey = (b.k === "origin" ? "originPropertyType" : "destPropertyType") as
                    "originPropertyType" | "destPropertyType";
                  const floorKey = (b.k === "origin" ? "originFloor" : "destFloor") as
                    "originFloor" | "destFloor";
                  const elevKey = (b.k === "origin" ? "originHasElevator" : "destHasElevator") as
                    "originHasElevator" | "destHasElevator";
                  const prop = data[propKey];
                  return (
                    <div className="space-y-2">
                      <Label className="text-xs">Tipo de imóvel</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "casa", label: "Casa" },
                          { id: "apartamento", label: "Apartamento" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => update(propKey, opt.id as any)}
                            className={cn(
                              "py-2 rounded-lg border-2 text-xs font-bold transition-all",
                              prop === opt.id
                                ? "border-primary bg-primary text-black shadow-glow"
                                : "border-white/40 bg-background hover:border-primary/50"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {prop === "apartamento" && (
                        <div className="space-y-2 pt-1">
                          <div>
                            <Label className="text-xs">Andar *</Label>
                            <div className="grid grid-cols-5 gap-1.5 mt-1">
                              {["1","2","3","4","5+"].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => update(floorKey, opt)}
                                  className={cn(
                                    "py-2 rounded-lg border-2 text-xs font-bold transition-all",
                                    data[floorKey] === opt
                                      ? "border-primary bg-primary text-black shadow-glow"
                                      : cn(
                                          "bg-background hover:border-primary/50",
                                          attempted && !data[floorKey]
                                            ? "border-destructive"
                                            : "border-white/40"
                                        )
                                  )}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Tem elevador?</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {[
                                { id: "sim", label: "Sim" },
                                { id: "nao", label: "Não" },
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => update(elevKey, opt.id as any)}
                                  className={cn(
                                    "py-2 rounded-lg border-2 text-xs font-bold transition-all",
                                    data[elevKey] === opt.id
                                      ? "border-primary bg-primary text-black shadow-glow"
                                      : "border-white/40 bg-background hover:border-primary/50"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 1 — Items with tabs + counters */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2">
            <Package className="text-primary" /> O que vamos transportar?
          </h3>

          {/* Tabs — wrap em várias linhas no mobile para não esconder áreas */}
          <div className="items-tabs flex flex-wrap gap-1.5 pb-2">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id} type="button" onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md whitespace-nowrap font-semibold text-xs transition-all",
                  activeTab === id
                    ? "bg-primary text-white"
                    : "bg-black/40 text-muted-foreground hover:text-foreground border border-white/10"
                )}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Items grid — 2 columns mobile, 3 on tablet+ */}
          <div
            className="items-grid gap-2.5 w-full"
            style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}
          >
            {currentTab.items.map(({ id, label, Icon }) => {
              const qty = data.items[id] || 0;
              const selected = qty > 0;
              return (
                <div
                  key={id}
                  data-selected={selected ? "true" : "false"}
                  className={cn(
                    "item-card select-none rounded-lg p-3 flex flex-col items-center justify-between gap-1.5 transition-all bg-black min-w-0 w-full overflow-hidden",
                    !selected && "cursor-pointer"
                  )}
                  style={{ maxHeight: 140, minHeight: 130, userSelect: "none", WebkitUserSelect: "none" }}
                  onMouseDown={(e) => {
                    // Prevent text selection on rapid taps/clicks
                    if ((e.target as HTMLElement).tagName !== "BUTTON") e.preventDefault();
                  }}
                  onClick={(e) => {
                    if (selected) return;
                    if ((e.target as HTMLElement).closest("button")) return;
                    incItem(id);
                  }}
                >
                  <Icon className={cn("w-6 h-6 shrink-0 pointer-events-none", selected ? "text-primary" : "text-muted-foreground")} />
                  <span
                    className="font-semibold text-center leading-tight text-foreground select-none pointer-events-none"
                    style={{ fontSize: "1.125rem", lineHeight: 1.15, userSelect: "none", WebkitUserSelect: "none" }}
                  >
                    {label}
                  </span>
                  {selected ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decItem(id)}
                        className="counter-btn w-7 h-7 rounded-full bg-black grid place-content-center text-primary hover:bg-primary hover:text-white transition"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-base min-w-[1.2rem] text-center text-primary">{qty}</span>
                      <button
                        type="button"
                        onClick={() => incItem(id)}
                        className="counter-btn w-7 h-7 rounded-full bg-black grid place-content-center text-primary hover:bg-primary hover:text-white transition"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => incItem(id)}
                      className="text-xs font-bold text-primary px-2 py-1 rounded hover:bg-primary/10 transition"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* "Outros" free text - only if outros-livre selected */}
          {data.items["outros-livre"] && (
            <div>
              <Label className="text-xs">Descreva o(s) item(ns) "Outros" *</Label>
              <Input className="mt-1" placeholder="Ex: aquário, esteira..."
                value={data.itemsOtherText}
                onChange={(e) => update("itemsOtherText", e.target.value)} />
            </div>
          )}

          {/* Summary footer */}
          <div className="rounded-xl bg-background border border-primary/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-display text-sm text-primary font-bold">
                ITENS SELECIONADOS ({itemsCount})
              </div>
              {itemsCount > 0 && (
                <button type="button" onClick={() => update("items", {})}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
            {itemsCount === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum item selecionado ainda. Toque nos itens acima.</p>
            ) : (
              <ul className="space-y-1">
                {Object.entries(data.items).map(([id, qty]) => (
                  <li key={id} className="text-sm flex justify-between">
                    <span>{ALL_ITEMS[id]}</span>
                    <span className="font-bold text-primary">{qty}x</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Alert>
            ⚠️ Materiais de construção a granel (cimento, areia, brita) <b>não são aceitos</b>. Exceção apenas para itens embalados em caixas fechadas.
          </Alert>
        </div>
      )}

      {/* Step 2 — Details */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2"><CalendarIcon className="text-primary" /> Quando?</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs">Data desejada *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full mt-1 justify-start", !data.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.date ? format(data.date, "PPP", { locale: ptBR }) : "Escolha a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(92vw,340px)] p-0" align="start" sideOffset={6}>
                  <Calendar mode="single" selected={data.date} onSelect={(d) => {
                    if (!d || d.getDay() === 0) return;
                    update("date", d);
                    setDatePickerOpen(false);
                  }}
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0)) || d.getDay() === 0}
                    initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Período *</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {PERIODS.map(({ id, label, Icon }) => (
                  <button key={id} type="button"
                    aria-pressed={data.period === id}
                    onClick={() => update("period", id)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-all cursor-pointer",
                      data.period === id
                        ? "border-primary bg-primary text-black shadow-glow"
                        : "border-border bg-background hover:border-primary/50"
                    )}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border cursor-pointer">
            <Checkbox checked={data.needsHelpers} onCheckedChange={(v) => update("needsHelpers", !!v)} className="mt-0.5" />
            <div>
              <div className="font-bold text-sm">Preciso de ajudantes</div>
              <div className="text-xs text-muted-foreground">O motorista não realiza carga/descarga. Será orçado separadamente.</div>
            </div>
          </label>

          {/* Conditions multi-select buttons */}
          <div>
            <Label className="text-xs mb-2 block">Condições do local (selecione todas que se aplicam)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONDITIONS.map(({ id, label }) => {
                const sel = data.conditions.includes(id);
                return (
                  <button key={id} type="button" onClick={() => toggleCondition(id)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg border-2 text-xs font-bold transition-all text-left",
                      sel ? "border-primary bg-background text-primary shadow-glow"
                          : "border-border bg-background hover:border-primary/50"
                    )}>
                    {sel ? "✓ " : ""}{label}
                  </button>
                );
              })}
            </div>
          </div>

          {data.conditions.includes("outros-cond") && (
            <div>
              <Label className="text-xs">Descreva "Outros" condições *</Label>
              <Input className="mt-1" value={data.conditionsOtherText}
                onChange={(e) => update("conditionsOtherText", e.target.value)} />
            </div>
          )}

          <div>
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea className="mt-1" rows={3} placeholder="Algo mais que devemos saber?"
              value={data.observations} onChange={(e) => update("observations", e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 3 — Contact + Summary */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in-50">
          <h3 className="font-display text-xl flex items-center gap-2">
            <ScrollText className="text-primary" /> Resumo do pedido
          </h3>

          <div className="rounded-xl bg-background border-2 border-primary/40 p-4 space-y-3 text-sm">
            <div>
              <div className="font-bold text-primary text-xs tracking-widest">📍 ORIGEM</div>
              <div>{data.originCity}{data.originNeighborhood && ` — ${data.originNeighborhood}`}</div>
            </div>
            <div>
              <div className="font-bold text-primary text-xs tracking-widest">🎯 DESTINO</div>
              <div>{data.destCity}{data.destNeighborhood && ` — ${data.destNeighborhood}`}</div>
            </div>
            <div>
              <div className="font-bold text-primary text-xs tracking-widest">📦 ITENS ({itemsCount})</div>
              <ul className="text-xs space-y-0.5">
                {Object.entries(data.items).map(([id, qty]) => (
                  <li key={id}>• {qty}x {ALL_ITEMS[id]}{id === "outros-livre" && data.itemsOtherText ? `: ${data.itemsOtherText}` : ""}</li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="font-bold text-primary text-xs tracking-widest">📅 DATA</div>
                <div>{data.date ? format(data.date, "dd/MM/yyyy", { locale: ptBR }) : "-"}</div>
              </div>
              <div>
                <div className="font-bold text-primary text-xs tracking-widest">🕒 PERÍODO</div>
                <div>{PERIODS.find(p => p.id === data.period)?.label || "-"}</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-primary text-xs tracking-widest">👷 AJUDANTES</div>
              <div>{data.needsHelpers ? "Sim (orçado separadamente)" : "Não"}</div>
            </div>
            {data.conditions.length > 0 && (
              <div>
                <div className="font-bold text-primary text-xs tracking-widest">🏠 CONDIÇÕES</div>
                <ul className="text-xs space-y-0.5">
                  {data.conditions.map(c => (
                    <li key={c}>• {CONDITIONS.find(x => x.id === c)?.label}{c === "outros-cond" && data.conditionsOtherText ? `: ${data.conditionsOtherText}` : ""}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.observations && (
              <div>
                <div className="font-bold text-primary text-xs tracking-widest">📝 OBS</div>
                <div className="text-xs">{data.observations}</div>
              </div>
            )}
          </div>

          <h3 className="font-display text-xl flex items-center gap-2 pt-2">
            <User className="text-primary" /> Seu contato
          </h3>
          <div>
            <Label className="text-xs">Nome *</Label>
            <Input
              className={cn("mt-1", attempted && data.name.trim().length <= 1 && "!border-destructive")}
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">WhatsApp *</Label>
            <Input
              className={cn(
                "mt-1",
                data.whatsapp.replace(/\D/g, "").length < 10 && "!border-destructive"
              )}
              placeholder="(51) 99999-9999"
              value={data.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
            />
          </div>
          <Alert>
            ⚠️ Quanto mais preciso você for, mais precisa será sua cotação.
          </Alert>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button className="bg-gradient-brand text-white font-bold shadow-glow"
            onClick={tryNext}>
            Próximo <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button className="bg-gradient-brand text-white font-bold shadow-glow disabled:opacity-50"
            disabled={submitting || !canNext()}
            onClick={() => { if (!canNext()) { setAttempted(true); return; } submit(); }}>
            <Send className="w-4 h-4 mr-2" /> {submitting ? "Enviando..." : "SOLICITAR COTAÇÃO"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 p-3 rounded-lg bg-background border border-warning/30 text-xs text-white">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-warning mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
