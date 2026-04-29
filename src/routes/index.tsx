import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { QuoteStepper } from "@/components/site/QuoteStepper";
import { HowItWorks, Services } from "@/components/site/Sections";
import { Zap } from "lucide-react";
import { COMPANY_TAGLINE } from "@/lib/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central Fretes RS — Seu frete em segundos" },
      { name: "description", content: "Cotação de fretes em segundos no Rio Grande do Sul. Mudanças, móveis, eletrodomésticos, comercial, litoral e interior. Solicite agora pelo WhatsApp." },
      { property: "og:title", content: "Central Fretes RS — Seu frete em segundos" },
      { property: "og:description", content: "Cotação rápida pelo WhatsApp em todo o RS." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section id="cotacao" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand-soft pointer-events-none" />
          <div className="container mx-auto px-4 pt-12 pb-16 relative">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-primary/30">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold tracking-widest uppercase text-primary">Cotação instantânea</span>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
                  Seu frete <br /><span className="text-gradient-brand">em segundos</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  {COMPANY_TAGLINE}. Preencha 4 etapas rápidas e receba seu orçamento direto no WhatsApp. Atendemos toda região metropolitana, litoral e interior do RS.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-2 rounded-lg bg-card border border-border text-xs"><span className="text-primary font-bold">+5 anos</span> no mercado</div>
                  <div className="px-3 py-2 rounded-lg bg-card border border-border text-xs"><span className="text-primary font-bold">100%</span> WhatsApp</div>
                  <div className="px-3 py-2 rounded-lg bg-card border border-border text-xs"><span className="text-primary font-bold">RS</span> inteiro</div>
                </div>
              </div>
              <div>
                <QuoteStepper />
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />
        <Services />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
