import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "../../lib/utils";

type Variant = "default" | "secondary" | "accent" | "outline" | "ghost" | "destructive" | "ai";
type Size = "default" | "sm" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
  accent: "bg-accent text-accent-foreground hover:opacity-90",
  outline: "border border-border bg-white/60 hover:bg-white/90",
  ghost: "bg-transparent hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  ai: "bg-ai text-ai-foreground hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  icon: "h-10 w-10 shrink-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
