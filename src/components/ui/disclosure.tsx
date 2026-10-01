import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

// Accordion built on native <details>: the content is part of the server HTML
// (indexable, works without JS). Items sharing the same `name` behave as a
// single-open accordion in modern browsers.
function Disclosure({
  summary,
  children,
  className,
  summaryClassName,
  contentClassName,
  ...props
}: Omit<React.ComponentProps<"details">, "summary"> & {
  summary: React.ReactNode;
  summaryClassName?: string;
  contentClassName?: string;
}) {
  return (
    <details className={cn("disclosure group border-b-2", className)} {...props}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-start justify-between gap-4 rounded-md py-4 text-left font-body text-base font-bold transition-colors outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/60 md:py-5 md:text-xl [&::-webkit-details-marker]:hidden",
          summaryClassName,
        )}
      >
        {summary}
        <ChevronDownIcon
          aria-hidden
          className="pointer-events-none size-6 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 md:size-8"
        />
      </summary>
      <div className={cn("max-w-4xl pt-0 pb-5 type-body", contentClassName)}>{children}</div>
    </details>
  );
}

export { Disclosure };
