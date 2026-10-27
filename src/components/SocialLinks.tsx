import { createLucideIcon, Mail, Send } from "lucide-react";

import FooterIcon from "@/components/sections/FooterIcon";
import { site } from "@/content/site";

// lucide-react 1.0 dropped brand icons; this is its Instagram icon from 0.544, drawn the same way
const Instagram = createLucideIcon("instagram", [
  ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "2e1cvw" }],
  ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" }],
  ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }],
]);

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
