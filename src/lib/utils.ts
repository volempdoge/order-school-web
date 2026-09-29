import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the typography utilities from globals.css, so that
// `cn("text-sm", "type-body")` keeps only `type-body` instead of both sizes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ type: ["display", "h2", "h3", "quote", "lead", "body", "small"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
