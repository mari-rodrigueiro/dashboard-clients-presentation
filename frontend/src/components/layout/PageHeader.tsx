import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { BriefcaseBusiness } from "lucide-react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, action }: PageIntroProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">{eyebrow}</p>
        <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface SectionHeadingProps {
  icon?: ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({
  icon: Icon = BriefcaseBusiness,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
