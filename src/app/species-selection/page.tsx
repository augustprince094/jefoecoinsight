
import Link from 'next/link';
import { JefoLogo } from '@/components/icons/jefo-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PigIcon } from '@/components/icons/pig-icon';
import { CowIcon } from '@/components/icons/cow-icon';
import { HenIcon } from '@/components/icons/hen-icon';

const speciesList = [
  {
    name: 'Broilers',
    icon: <HenIcon className="h-10 w-10 text-primary" />,
    description: 'Optimize your poultry production for sustainability and profitability.',
    link: '/calculator?species=broilers',
    enabled: true,
  },
  {
    name: 'Swine',
    icon: <PigIcon className="h-10 w-10 text-muted-foreground" />,
    description: 'Coming soon: GHG and ROI calculations for pig farming.',
    link: '#',
    enabled: false,
  },
  {
    name: 'Dairy',
    icon: <CowIcon className="h-10 w-10 text-muted-foreground" />,
    description: 'Coming soon: Insights for sustainable dairy operations.',
    link: '#',
    enabled: false,
  },
];

export default function SpeciesSelectionPage() {
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
              <Link href="/feed-additives" className="text-muted-foreground hover:text-primary">Feed additives</Link>
              <Link href="/species-selection" className="font-semibold text-primary border-b-2 border-primary">
                  Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                Select a Species to Begin
              </h1>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Choose a livestock type to analyze its sustainability profile and financial returns with Jefo solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {speciesList.map((species) => (
                <Card 
                  key={species.name} 
                  className={`flex flex-col text-center transition-all ${!species.enabled ? 'bg-muted/50' : 'hover:shadow-lg hover:-translate-y-1'}`}
                >
                  <CardHeader className="items-center">
                    {species.icon}
                    <CardTitle className={`text-2xl ${!species.enabled ? 'text-muted-foreground' : 'text-primary'}`}>
                      {species.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <p className={`text-muted-foreground mb-6 ${!species.enabled ? '' : 'text-foreground/80'}`}>
                      {species.description}
                    </p>
                    <Button asChild disabled={!species.enabled} variant={species.enabled ? 'default' : 'secondary'}>
                      <Link href={species.link}>
                        {species.enabled ? 'Start Calculating' : 'Coming Soon'}
                        {species.enabled && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
