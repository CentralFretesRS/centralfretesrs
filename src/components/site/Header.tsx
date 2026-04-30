import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/"><Logo size={36} /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
          <a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a>
          <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
        </nav>
        <Button asChild className="bg-gradient-brand text-white font-bold hover:opacity-90 shadow-glow">
          <a href="#cotacao">Solicitar Cotação</a>
        </Button>
      </div>
    </header>
  );
}
