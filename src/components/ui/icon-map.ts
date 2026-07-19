import {
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wrench,
  AlertTriangle,
  CalendarClock,
  Receipt,
  Users,
  FileText,
  Inbox,
  UserX,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

export const iconMap = {
  wallet: Wallet,
  clock: Clock,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "chart-bar": BarChart3,
  tools: Wrench,
  "alert-triangle": AlertTriangle,
  calendar: CalendarClock,
  receipt: Receipt,
  users: Users,
  "file-text": FileText,
  inbox: Inbox,
  "user-x": UserX,
  "hand-coins": HandCoins,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;
