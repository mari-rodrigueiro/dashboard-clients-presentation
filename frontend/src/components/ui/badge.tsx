import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "ai";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-success/25 bg-success-bg text-success",
  warning: "border-warning/25 bg-warning-bg text-warning",
  danger: "border-danger/25 bg-danger-bg text-danger",
  ai: "border-ai/20 bg-ai-muted text-ai",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Bolinha antes do texto — usada para indicadores de status (saúde, severidade). */
  dot?: boolean;
}

export function Badge({
  className,
  tone = "neutral",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
