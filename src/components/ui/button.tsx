import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-none border border-transparent text-xs font-medium uppercase tracking-[0.18em] whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity] duration-300 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rtl:tracking-normal rtl:text-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-ink-soft",
        gold: "bg-gold text-ink hover:bg-gold-light",
        outline:
          "border-foreground/80 bg-transparent text-foreground hover:bg-foreground hover:text-background",
        "outline-light":
          "border-ivory/80 bg-transparent text-ivory hover:bg-ivory hover:text-ink",
        secondary: "bg-secondary text-secondary-foreground hover:bg-border",
        ghost: "hover:bg-muted hover:text-foreground normal-case tracking-normal text-sm",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        link: "text-foreground underline-offset-4 hover:underline normal-case tracking-normal text-sm",
      },
      size: {
        default: "h-12 px-7",
        xs: "h-7 px-2.5 text-[0.65rem]",
        sm: "h-9 px-4",
        lg: "h-14 px-9",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
