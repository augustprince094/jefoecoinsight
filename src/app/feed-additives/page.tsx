
import Link from 'next/link';
import { JefoLogo } from '@/components/icons/jefo-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const additives = [
  {
    name: 'Jefo Pro Solution',
    lcaSummary: 'Jefo Pro Solution demonstrates a significant reduction in environmental impact by improving nutrient utilization. The life cycle assessment highlights lower greenhouse gas emissions per unit of output, primarily driven by enhanced feed conversion and reduced waste.',
    paperLink: 'https://example.com/paper-jefo-pro-solution'
  },
  {
    name: 'Jefo P(OA+EO)',
    lcaSummary: 'The use of Jefo P(OA+EO) contributes to a more sustainable production cycle by promoting gut health and reducing the need for interventions. Our LCA shows a notable decrease in the carbon footprint associated with broiler production through improved animal health and performance.',
    paperLink: 'https://example.com/paper-jefo-poaeo'
  },
  {
    name: 'Jefo Xylanase',
    lcaSummary: 'Jefo Xylanase allows for the use of more diverse and sustainable feed ingredients by breaking down complex carbohydrates. The LCA confirms that this leads to a lower environmental footprint, attributed to better feed digestibility and reduced nutrient excretion.',
    paperLink: 'https://example.com/paper-jefo-xylanase'
  },
];

export default function FeedAdditivesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <JefoLogo className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-primary">Jefo EcoInsight</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/about" className="text-muted-foreground hover:text-primary">About App</Link>
              <Link href="/feed-additives" className="font-semibold text-primary border-b-2 border-primary">Feed additives</Link>
              <Link href="/calculator" className="text-muted-foreground hover:text-primary">
                  Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Our Feed Additive Solutions
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Discover the science and sustainable impact behind Jefo's innovative feed additives.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8">
            {additives.map((additive) => (
              <Card key={additive.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{additive.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div>
                    <CardDescription className="text-base text-foreground/80 mb-6">{additive.lcaSummary}</CardDescription>
                  </div>
                  <Button asChild variant="outline">
                    <a href={additive.paperLink} target="_blank" rel="noopener noreferrer">
                      View Published Paper
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-card/80 border-t py-6 mt-16">
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
    </div>
  );
}
