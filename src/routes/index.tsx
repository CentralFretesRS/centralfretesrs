import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { QuoteStepper } from "@/components/site/QuoteStepper";
import { HowItWorks, Services } from "@/components/site/Sections";
import { ThemedSections } from "@/components/site/ThemedSections";
import { Zap } from "lucide-react";
import { COMPANY_TAGLINE } from "@/lib/config";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: "Central Fretes RS",
  description:
    "Fretes e mudanças em Canoas, Porto Alegre, Grande Porto Alegre, Litoral Gaúcho e Interior do Rio Grande do Sul.",
  url: "https://centraldefretesrs.lovable.app/",
  telephone: "+55-51-99733-7388",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Canoas",
    addressRegion: "RS",
    addressCountry: "BR",
  },
  areaServed: [
    { "@type": "State", name: "Rio Grande do Sul" },
    { "@type": "City", name: "Canoas" },
    { "@type": "City", name: "Porto Alegre" },
  ],
  priceRange: "$$",
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    "Pequenos Fretes",
    "Mudanças Residenciais",
    "Transporte de Móveis",
    "Frete Comercial e Empresarial",
    "Fretes para o Litoral",
    "Fretes Compartilhados",
    "Fretes Interior do RS",
  ].map((name) => ({
    "@type": "Service",
    serviceType: name,
    provider: { "@type": "MovingCompany", name: "Central Fretes RS" },
    areaServed: { "@type": "State", name: "Rio Grande do Sul" },
  })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central Fretes RS — Frete e Mudança em Canoas Porto Alegre Litoral e todo o RS" },
      { name: "description", content: "Solicite seu frete ou mudança em segundos. Atendemos Canoas, Porto Alegre, litoral e interior do RS. Orçamento grátis pelo WhatsApp!" },
      { property: "og:title", content: "Central Fretes RS — Frete e Mudança em Canoas Porto Alegre Litoral e todo o RS" },
      { property: "og:description", content: "Solicite seu frete ou mudança em segundos. Atendemos Canoas, Porto Alegre, litoral e interior do RS. Orçamento grátis pelo WhatsApp!" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(servicesJsonLd),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background">
        {/* HERO */}
        <section id="cotacao" className="relative overflow-hidden bg-background">
          <div className="container mx-auto px-4 pt-12 pb-16 relative">
            <div className="grid lg:grid-cols-2 gap-10 items-center min-w-0">
              <div className="space-y-6 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-primary/30">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold tracking-widest uppercase text-primary">Cotação instantânea</span>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
                  Seu Frete <br /><span className="text-gradient-brand">em Segundos</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  {COMPANY_TAGLINE}. Preencha 4 etapas rápidas e receba seu orçamento direto no WhatsApp. Atendemos toda região metropolitana, litoral e interior do RS.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="#dez-anos" className="px-3 py-2 rounded-lg bg-black border-2 border-[#FF8C00] text-xs text-white hover:brightness-125 transition-all"><span className="text-primary font-bold">+10 anos</span> no mercado</a>
                  <a href="#whatsapp" className="px-3 py-2 rounded-lg bg-black border-2 border-[#FF8C00] text-xs text-white hover:brightness-125 transition-all"><span className="text-primary font-bold">100%</span> WhatsApp</a>
                  <a href="#rs-inteiro" className="px-3 py-2 rounded-lg bg-black border-2 border-[#FF8C00] text-xs text-white hover:brightness-125 transition-all"><span className="text-primary font-bold">RS</span> inteiro</a>
                  <a href="#fretes-compartilhados" className="px-3 py-2 rounded-lg bg-black border-2 border-[#FF8C00] text-xs text-white hover:brightness-125 transition-all"><span className="text-primary font-bold">Fretes</span> Compartilhados</a>
                </div>
              </div>
              <div className="min-w-0 w-full">
                <QuoteStepper />
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />
        <ThemedSections />
        <Services />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
