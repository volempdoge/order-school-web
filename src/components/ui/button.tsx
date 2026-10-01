import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

// The only button styles on the site. One accent red everywhere; the darker red is only a hover state.
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-body font-bold tracking-wide whitespace-nowrap uppercase transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // On light backgrounds
        primary: "bg-primary text-primary-foreground hover:bg-primary-strong",
        // On photos and red surfaces
        light: "bg-white text-primary hover:bg-primary hover:text-white",
        outlineLight: "border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-[1.1875rem]",
        lg: "h-14 px-8 text-[1.1875rem] md:h-16 md:px-12 md:text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
