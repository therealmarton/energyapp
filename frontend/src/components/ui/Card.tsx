import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

interface Props {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  "data-testid"?: string;
}

export function Card({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children,
  ...rest
}: PropsWithChildren<Props>) {
  return (
    <section className={clsx("card", className)} data-testid={rest["data-testid"]}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 sm:px-6 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={clsx("card-pad", bodyClassName)}>{children}</div>
    </section>
  );
}
