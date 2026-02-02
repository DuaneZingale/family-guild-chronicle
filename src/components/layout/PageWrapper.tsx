import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-3xl sm:text-4xl font-fantasy text-foreground tracking-wide">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-lg">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
