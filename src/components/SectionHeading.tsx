import { cn } from "@/lib/utils";

// The one heading style for every section: display font, uppercase, red bar underneath.
export default function SectionHeading({
  children,
  align = "center",
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  /** `responsive` — left on phones, centered from md */
  align?: "center" | "left" | "responsive";
  /** `inverse` — on red or dark surfaces */
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <div
      className={cn(
        { center: "text-center", left: "text-left", responsive: "text-left md:text-center" }[align],
        className,
      )}
    >
      <h2 className={cn("type-h2", tone === "inverse" ? "text-white" : "text-foreground")}>{children}</h2>
      <span
        aria-hidden
        className={cn(
          "mt-4 block h-1 w-24 rounded-full md:mt-5",
          tone === "inverse" ? "bg-white" : "bg-primary",
          align === "center" && "mx-auto",
          align === "responsive" && "md:mx-auto",
        )}
      />
    </div>
  );
}
