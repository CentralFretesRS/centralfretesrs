import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Kanban } from "@/components/admin/Kanban";
import { Financial } from "@/components/admin/Financial";
import { LogOut, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel — Central Fretes RS" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [notif, setNotif] = useState(typeof Notification !== "undefined" && Notification.permission === "granted");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate({ to: "/" }); return; }
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/" });
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [navigate]);

  const enableNotif = async () => {
    if (!("Notification" in window)) { toast.error("Navegador não suporta notificações"); return; }
    const p = await Notification.requestPermission();
    setNotif(p === "granted");
    if (p === "granted") toast.success("Notificações ativadas");
  };

  const ping = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start(); o.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size={32} />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={enableNotif}>
              {notif ? <Bell className="w-4 h-4 mr-1 text-success" /> : <BellOff className="w-4 h-4 mr-1" />}
              <span className="hidden sm:inline">Notificações</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="w-4 h-4 mr-1" /><span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <audio ref={audioRef} />
        <h1 className="font-display text-3xl mb-4">Painel Gerencial</h1>
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Cotações</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="mt-4">
            <Kanban onNew={ping} />
          </TabsContent>
          <TabsContent value="financial" className="mt-4">
            <Financial />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
