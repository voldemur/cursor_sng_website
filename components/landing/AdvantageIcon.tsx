import {
  Activity,
  Layers,
  Network,
  ScrollText,
  ShieldCheck,
  Timer,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  timer: Timer,
  layers: Layers,
  shield: ShieldCheck,
  scroll: ScrollText,
  network: Network,
};

export const ICON_OPTIONS = Object.keys(ICONS);

export function AdvantageIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Activity;
  return <Icon className={className} aria-hidden="true" />;
}
