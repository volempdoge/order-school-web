import type { LucideIcon } from "lucide-react";

interface FooterIconProps {
  icon: LucideIcon;
}

export default function FooterIcon({ icon: Icon }: FooterIconProps) {
  return (
    <div className="cursor-pointer rounded-full border-2 border-white p-4 transition-colors hover:bg-white hover:text-primary-strong">
      <Icon />
    </div>
  );
}
