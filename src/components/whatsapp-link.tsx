"use client";

import { MessageCircle } from "lucide-react";
import { formatPhone } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppLinkProps = {
  phone: string;
  className?: string;
};

export function WhatsAppLink({ phone, className }: WhatsAppLinkProps) {
  const formattedPhone = formatPhone(phone);

  return (
    <a
      href={getWhatsAppUrl(phone)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Conversar no WhatsApp com ${formattedPhone}`}
      className={cn(
        "inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <MessageCircle aria-hidden className="size-3.5 shrink-0" />
      {formattedPhone}
    </a>
  );
}
