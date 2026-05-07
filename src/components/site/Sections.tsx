import { ClipboardList, MessageCircle, CheckCircle2, Package, Home, Sofa, Building2, Waves, Truck, MapPin } from "lucide-react";

export function HowItWorks() {
  const steps = [
    { Icon: ClipboardList, title: "Preencha os dados", desc: "Origem, destino, itens, data e contato. Rápido e sem complicação." },
    { Icon: MessageCircle, title: "Receba sua cotação", desc: "Em instantes você recebe o valor diretamente pelo WhatsApp." },
    { Icon: CheckCircle2, title: "Confirme e agende", desc: "Gostou do valor? Confirme e receba o agendamento do seu frete." },
  ];
  return (
    <section id="como-funciona" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="font-display text-xs tracking-[0.3em] text-primary mb-2">PROCESSO SIMPLES</div>
          <h2 className="font-display text-4xl sm:text-5xl">Como Funciona</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {steps.map(({ Icon, title, desc }, i) => (
            <div key={title} className="rounded-2xl bg-card border border-border p-6 shadow-card hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="font-display text-3xl text-gradient-brand font-bold">0{i+1}</div>
              </div>
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const items = [
    { Icon: Package, name: "Pequenos Fretes", desc: "Itens avulsos, encomendas e entregas rápidas" },
    { Icon: Home, name: "Mudanças & Transporte de Móveis", desc: "Mudanças residenciais completas com cuidado especial em cada móvel." },
    { Icon: Building2, name: "Comercial / Empresarial", desc: "Soluções para empresas e escritórios" },
    { Icon: Waves, name: "Litoral e Compartilhados", desc: "Fretes compartilhados para o litoral do RS e SC. Compartilhe o frete e economize." },
    { Icon: MapPin, name: "Interior do RS", desc: "Atendemos todo o estado" },
  ];
  return (
    <section id="servicos" className="py-20 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="font-display text-xs tracking-[0.3em] text-primary mb-2">O QUE FAZEMOS</div>
          <h2 className="font-display text-4xl sm:text-5xl">Nossos Serviços</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ Icon, name, desc }) => (
            <div key={name} className="group rounded-2xl bg-card border border-border p-5 shadow-card hover:border-primary hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-brand-soft border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-gradient-brand transition-all">
                <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-lg mb-1">{name}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
