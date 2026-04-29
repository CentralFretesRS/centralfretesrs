import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/config";

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank" rel="noreferrer"
      aria-label="Chamar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[oklch(0.70_0.18_145)] text-white flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
    >
      <MessageCircle className="w-7 h-7" fill="currentColor" />
    </a>
  );
}
