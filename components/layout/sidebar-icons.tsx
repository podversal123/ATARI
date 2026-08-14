import {
  LayoutDashboard,
  ListChecks,
  Database,
  ShieldCheck,
  Users,
  FileText,
  Images,
  GalleryHorizontalEnd,
  Target,
  History,
  Bell,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";
import type { SidebarIconName } from "@/lib/navigation";

export const SIDEBAR_ICONS: Record<SidebarIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  "form-summary": ListChecks,
  masters: Database,
  "role-management": ShieldCheck,
  "user-management": Users,
  "form-management": FileText,
  "module-images": Images,
  gallery: GalleryHorizontalEnd,
  targets: Target,
  "log-history": History,
  notifications: Bell,
  reports: FileBarChart,
};
