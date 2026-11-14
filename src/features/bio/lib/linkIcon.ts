import {
  ArrowUpRight, Calculator, CalendarDays, FileText, Handshake, Home, Mail, MapPin, Mic, Phone, Play, ShoppingBag, Star, Tag,
  Ticket, Truck, Users, UtensilsCrossed, type LucideIcon,
} from "lucide-react";
import { detectService } from "./serviceCatalog";

export type TileTone = "red" | "orange" | "yellow" | "green" | "mint" | "teal" | "cyan" | "blue" | "indigo" | "purple" | "pink" | "gray";

const KEYWORDS: [RegExp, LucideIcon, TileTone][] = [
  [/menu|zomato|swiggy|table|food/i, UtensilsCrossed, "orange"],
  [/direction|map|location|address|visit us/i, MapPin, "green"],
  [/phone|call us/i, Phone, "green"],
  [/book|call|session|appointment|schedule|reserve/i, CalendarDays, "red"],
  [/shop|store|arrival|merch|order|buy|favourite/i, ShoppingBag, "blue"],
  [/newsletter|email|mail|subscribe/i, Mail, "cyan"],
  [/video|watch|episode|listen|single|song|trailer/i, Play, "pink"],
  [/guest|podcast|show/i, Mic, "purple"],
  [/case stud|result|testimon|review/i, Star, "yellow"],
  [/price|pricing|services|offer/i, Tag, "indigo"],
  [/tour|dates|event|ticket|gig/i, Ticket, "orange"],
  [/listing|home|propert|flat/i, Home, "teal"],
  [/calculator|emi|loan/i, Calculator, "gray"],
  [/community|join|group/i, Users, "mint"],
  [/guide|size|plan|pdf|checklist/i, FileText, "indigo"],
  [/track|shipping|delivery/i, Truck, "teal"],
  [/sponsor|work with|partner|collab/i, Handshake, "mint"],
];

export type LinkIconMatch = { service: string } | { icon: LucideIcon; tone: TileTone };

export function linkIcon(label: string, url: string): LinkIconMatch {
  const service = url && url !== "#" ? detectService(url) : null;
  if (service) return { service: service.id };
  if (/whatsapp/i.test(label)) return { service: "whatsapp" };
  const match = KEYWORDS.find(([pattern]) => pattern.test(label));
  return match ? { icon: match[1], tone: match[2] } : { icon: ArrowUpRight, tone: "gray" };
}
