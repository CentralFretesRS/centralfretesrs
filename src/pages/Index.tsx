import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { QuoteStepper } from "@/components/site/QuoteStepper";
import { HowItWorks, Services } from "@/components/site/Sections";
import { ThemedSections } from "@/components/site/ThemedSections";
import { Zap } from "lucide-react";
import { useEffect } from "react";
import { COMPANY_TAGLINE } from "@/lib/config";

const SERVED_CITIES = [
  "Porto Alegre", "Canoas", "Novo Hamburgo", "São Leopoldo", "Gravataí",
  "Viamão", "Alvorada", "Cachoeirinha", "Esteio", "Sapucaia do Sul", "Guaíba",
  "Tramandaí", "Imbé", "Capão da Canoa", "Torres", "Osório", "Cidreira",
  "Balneário Pinhal", "Xangri-lá",
  "Caxias do Sul", "Bento Gonçalves", "Gramado", "Canela",
  "Santa Maria", "Passo Fundo", "Pelotas", "Rio Grande", "Uruguaiana",
  "Bagé", "Santa Cruz do Sul",
];

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: "Central Fretes RS",
  description:
    "Fretes e mudanças em Canoas, Porto Alegre, Grande Porto Alegre, Litoral Gaúcho, Serra e Interior do Rio Grande do Sul.",
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
    ...SERVED_CITIES.map((name) => ({
      "@type": "City",
      name,
      containedInPlace: { "@type": "State", name: "Rio Grande do Sul" },
    })),
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

export default function Index() {
  useEffect(() => {
    const ids = ["ld-local", "ld-services"];
    const data = [localBusinessJsonLd, servicesJsonLd];
    const els = ids.map((id, i) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = id;
      s.text = JSON.stringify(data[i]);
      document.head.appendChild(s);
      return s;
    });
    return () => { els.forEach((s) => s.remove()); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background">
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
    </div>
  );
}