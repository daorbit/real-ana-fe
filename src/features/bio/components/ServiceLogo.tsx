import { useState } from "react";
import {
  AtSign, BookOpen, Clapperboard, Gamepad2, Globe, MessageCircle, Music2, Podcast, ShoppingBag, Smartphone, Ticket,
  type LucideIcon,
} from "lucide-react";
import { serviceById, type ServiceCategory } from "@/features/bio/lib/serviceCatalog";
import classes from "./ServiceLogo.module.css";

const CATEGORY_ICON: Record<ServiceCategory, LucideIcon> = {
  music: Music2,
  video: Clapperboard,
  podcast: Podcast,
  social: AtSign,
  chat: MessageCircle,
  shop: ShoppingBag,
  app: Smartphone,
  game: Gamepad2,
  book: BookOpen,
  tickets: Ticket,
  web: Globe,
};

const ICON_PX = { sm: 14, md: 17, lg: 20 } as const;

export function ServiceLogo({ service, size = "md" }: { service: string; size?: keyof typeof ICON_PX }) {
  const entry = serviceById(service);
  const [failed, setFailed] = useState(false);

  if (entry.logo && !failed) {
    return (
      <img
        src={`/services/${entry.id}.svg`}
        alt=""
        aria-hidden
        loading="lazy"
        className={classes.logo}
        data-size={size}
        onError={() => setFailed(true)}
      />
    );
  }

  const Icon = CATEGORY_ICON[entry.category];
  return (
    <span className={classes.glyph} data-size={size} aria-hidden>
      <Icon size={ICON_PX[size]} />
    </span>
  );
}
