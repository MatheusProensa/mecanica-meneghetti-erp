import { MessageCircle } from "lucide-react";
import { formatPhoneBR, whatsappUrl } from "@/lib/format";

export default function WhatsAppLink({
  phone,
  className = "",
}: {
  phone: string | null | undefined;
  className?: string;
}) {
  const formatted = formatPhoneBR(phone);
  if (!formatted) return null;

  const url = whatsappUrl(phone);
  if (!url) return <span>{formatted}</span>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-green-700 hover:underline ${className}`}
    >
      <MessageCircle className="h-3.5 w-3.5 shrink-0" />
      {formatted}
    </a>
  );
}
