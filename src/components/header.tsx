"use client";

import Link from "next/link";

import { JefoLogo } from "@/components/icons/jefo-logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const Header = () => {
  const pathname = usePathname();

  const links = [
    {
      href: "/about",
      label: "About App",
    },
    {
      href: "/feed-additives",
      label: "Feed additives",
    },
    {
      href: "/species-selection",
      label: "Calculator",
    },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <JefoLogo className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-primary">
              Jefo EcoInsight
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-all",
                  link.label === 'Calculator' && 'bg-primary py-2 px-4 rounded-md !text-white',
                  pathname === link.href
                    ? "font-semibold text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
