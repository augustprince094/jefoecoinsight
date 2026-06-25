import { JefoLogo } from "@/components/icons/jefo-logo";

export const Footer = () => {
  return (
    <footer className="bg-card/80 border-t py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-muted-foreground text-sm flex justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Jefo | All rights reserved</p>
        <div className="text-right">
          <div className="flex justify-end mb-2">
            <JefoLogo className="h-8 w-8 text-primary" />
          </div>
          <p>5020, Jefo Avenue, CP 325 Saint-Hyacinthe (Quebec) J2S 7B6</p>
          <p className="mt-1">Phone: 450 799-2000 | 1 800 465-2247</p>
        </div>
      </div>
    </footer>
  );
};
