import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Download } from 'lucide-react';
import { JefoLogo } from '@/components/icons/jefo-logo';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <JefoLogo className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-primary">Jefo EcoInsight</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="#" className="text-muted-foreground hover:text-primary">About App</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Feed additives</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Applications</Link>
              <Link href="/calculator" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                  Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Image 
                  src="https://placehold.co/600x400.png"
                  alt="Diagram showing standard diet vs P(OA+EO) diet for pigs" 
                  width={600} 
                  height={400} 
                  className="rounded-lg shadow-lg"
                  data-ai-hint="pig diet diagram"
                />
              </div>
              <div className="text-center md:text-left">
                 <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  Lower your carbon footprint with Jefo solutions
                </h1>
                <Image 
                  src="https://placehold.co/500x300.png"
                  alt="Bar chart showing greenhouse gas emission reduction" 
                  width={500} 
                  height={300} 
                  className="rounded-lg shadow-lg mb-6"
                  data-ai-hint="emission reduction chart"
                />
                <p className="text-muted-foreground mb-8">
                  Incorporating the protected organic acid and essential oils could lower your carbon footprint by -4.8%
                </p>
                <div className="text-center">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/calculator">Calculate your savings</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Solution Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">A Simple solution with tangible results</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
              Watch how Jefo feed additives reduce the carbon impact of feed and the overall emissions of pork production.
            </p>
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0 relative">
                <Image 
                  src="https://placehold.co/960x540.png"
                  alt="Video thumbnail showing a pig and emission reduction stats" 
                  width={960} 
                  height={540}
                  className="w-full"
                  data-ai-hint="video thumbnail pig"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayCircle className="h-20 w-20 text-white/80 hover:text-white transition-colors cursor-pointer"/>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Download Section */}
        <section className="py-12 md:py-20 bg-card">
           <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">See how Jefo feed additives can help you reduce your carbon footprint</h2>
                <Button asChild size="lg" variant="outline">
                   <a href="#" download>
                    <Download className="mr-2" />
                    Download the Life Cycle Assessment
                  </a>
                </Button>
              </div>
              <div>
                <Image
                  src="https://placehold.co/500x300.png"
                  alt="Green abstract background"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-lg"
                  data-ai-hint="green abstract"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card/80 border-t py-8">
        <div className="container mx-auto px-4 text-muted-foreground text-sm">
           <div className="text-center">
             <div className="flex justify-center mb-4">
               <JefoLogo className="h-12 w-12 text-primary" />
             </div>
            <p>5020, Jefo Avenue, CP 325 Saint-Hyacinthe (Quebec) J2S 7B6</p>
            <p className="mt-1">Phone: 450 799-2000 | 1 800 465-2247</p>
           </div>
          <p className="mt-4 text-right">&copy; {new Date().getFullYear()} Jefo | All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
