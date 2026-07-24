import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageWrapper({ children, title, subtitle, action }: PageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-6">
        {(title || subtitle || action) && (
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-3xl sm:text-4xl font-fantasy text-foreground tracking-wide">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-1 text-lg">{subtitle}</p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
