import { ArrowRight } from "lucide-react";
import fleetImg from "@/assets/hero-van.jpg";
import sharedImg from "@/assets/section-shared.jpg";
import waImg from "@/assets/section-whatsapp.jpg";
import rsImg from "@/assets/section-rs.jpg";

type Section = {
  id: string;
  title: string;
  text: string;
  images: { src: string; alt: string }[];
  reverse?: boolean;
};

const sections: Section[] = [
  {
    id: "dez-anos",
    title: "+10 Anos de Experiência",
    text: "Mais de 10 anos conectando pessoas e negócios em todo o RS e SC. Frota variada, do pequeno furgão ao caminhão, com preços acessíveis para todo tipo de carga.",
    images: [
      { src: fleetImg, alt: "Frota de caminhões estilo Pixar" },
    ],
  },
  {
    id: "fretes-compartilhados",
    title: "Fretes Compartilhados",
    text: "Para quem busca economia sem abrir mão da eficiência. Nossos fretes compartilhados atendem principalmente o litoral do RS, com caminhões partindo semanalmente e distribuindo encomendas ao longo de toda a costa. Solicite sua cotação nessa modalidade e economize!",
    images: [
      { src: sharedImg, alt: "Caminhão compartilhado rumo ao litoral" },
    ],
    reverse: true,
  },
  {
    id: "whatsapp",
    title: "100% WhatsApp",
    text: "Descreva o que você precisa e logo nossa equipe entrará em contato com a melhor solução para você.",
    images: [
      { src: waImg, alt: "Atendimento ágil pelo WhatsApp" },
    ],
  },
  {
    id: "rs-inteiro",
    title: "Área de Atuação",
    text: "Atendemos toda a região metropolitana de Porto Alegre, litoral gaúcho e interior do Rio Grande do Sul.",
    images: [
      { src: rsImg, alt: "Mapa 3D do Rio Grande do Sul" },
    ],
    reverse: true,
  },
];

export function ThemedSections() {
  return (
    <div className="border-t border-border/40">
      {sections.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className="scroll-mt-24 py-20 border-b border-border/40 last:border-b-0"
        >
          <div className="container mx-auto px-4">
            <div
              className={`grid lg:grid-cols-2 gap-10 items-center ${
                s.reverse ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Illustration */}
              <div className="grid grid-cols-1 gap-4">
                {s.images.map((img) => (
                  <div
                    key={img.src}
                    className="relative rounded-3xl overflow-hidden border-2 border-[#FF8C00]/40 bg-card shadow-glow"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      width={1024}
                      height={1024}
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Text */}
              <div className="space-y-6">
                <div className="font-display text-xs tracking-[0.3em] text-primary">
                  CENTRAL FRETES RS
                </div>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
                  <span className="text-gradient-brand">{s.title}</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl">{s.text}</p>
                <a
                  href="#cotacao"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-display text-base font-bold uppercase tracking-wide shadow-glow hover:brightness-110 transition-all"
                >
                  Solicitar Cotação
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
