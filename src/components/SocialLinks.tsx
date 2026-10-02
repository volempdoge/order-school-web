import { Instagram, Mail, Send } from "lucide-react";

import FooterIcon from "@/components/sections/FooterIcon";
import { site } from "@/content/site";

// One order everywhere. Telegram first: it is the main channel the texts point to.
const links = [
  { label: "Telegram", href: site.telegram, icon: Send, external: true },
  { label: "Instagram", href: site.instagram, icon: Instagram, external: true },
  { label: "Email", href: `mailto:${site.email}`, icon: Mail, external: false },
];

export default function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      {links.map(({ label, href, icon, external }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        >
          <FooterIcon icon={icon} />
        </a>
      ))}
    </div>
  );
}
