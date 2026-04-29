import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Settings, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { COMPANY_CITY, COMPANY_NAME } from "@/lib/config";

export function Footer() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("admin@centralfretesrs.com");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) { toast.error("Credenciais inválidas"); return; }
    setOpen(false);
    navigate({ to: "/admin" });
  };

  return (
    <footer id="contato" className="border-t border-border bg-card/40 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div>
            <Logo size={36} />
            <p className="text-sm text-muted-foreground mt-4">{COMPANY_CITY}</p>
          </div>
          <div>
            <h4 className="font-display text-sm tracking-widest text-primary mb-3">CONTATO</h4>
            <p className="text-sm text-muted-foreground">Atendimento via WhatsApp</p>
            <p className="text-sm text-muted-foreground">Segunda a Sábado</p>
          </div>
          <div>
            <h4 className="font-display text-sm tracking-widest text-primary mb-3">REDES</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-gradient-brand hover:text-background transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-gradient-brand hover:text-background transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-gradient-brand hover:text-background transition-all"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 flex items-center justify-between">
          <button onClick={() => setOpen(true)} aria-label="Painel" className="text-muted-foreground/40 hover:text-primary transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <p className="text-xs text-muted-foreground">© 2025 {COMPANY_NAME}</p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Acesso Gerencial</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Senha</Label>
              <Input type="password" className="mt-1" value={pwd} onChange={(e) => setPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()} />
            </div>
            <Button onClick={login} disabled={loading} className="w-full bg-gradient-brand text-background font-bold">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
