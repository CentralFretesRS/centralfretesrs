import { MapPin } from "lucide-react";

export function ServiceAreas() {
  const regions = [
    {
      title: "Grande Porto Alegre",
      cities: ["Porto Alegre", "Canoas", "Esteio", "Sapucaia do Sul", "São Leopoldo", "Novo Hamburgo"],
    },
    {
      title: "Litoral Norte",
      cities: ["Tramandaí", "Capão da Canoa", "Torres"],
    },
  ];

  return (
    <section id="onde-atuamos" className="py-20 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="font-display text-xs tracking-[0.3em] text-primary mb-2">ATENDIMENTO LOCAL</div>
          <h2 className="font-display text-4xl sm:text-5xl">Onde Atuamos</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {regions.map((region) => (
            <div
              key={region.title}
              className="rounded-2xl bg-black border-2 border-[#FF8C00] p-6 shadow-card hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl text-white">{region.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {region.cities.map((city) => (
                  <span
                    key={city}
                    className="px-3 py-1.5 rounded-lg bg-black border border-[#FF8C00]/60 text-xs text-white"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
