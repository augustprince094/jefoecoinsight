
import Link from 'next/link';
import { JefoLogo } from '@/components/icons/jefo-logo';

export default function AboutPage() {
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
              <Link href="/about" className="font-semibold text-primary border-b-2 border-primary">About App</Link>
              <Link href="/feed-additives" className="text-muted-foreground hover:text-primary">Feed additives</Link>
              <Link href="/species-selection" className="text-muted-foreground hover:text-primary">
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
              About Jefo EcoInsight
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Empowering sustainable livestock production through data-driven decisions.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground/90">
            <p>
            The Jefo Eco-insight (JEI) system is built to provides an estimate and comparable analyses and insights into
             environmental impacts, feed additive interventions, and improvements throughout the livestock value chain. 
             The system complies with internationally recognized Food and Agricultural Organization’s Livestock Environmental Assessment and Performance guidelines for feed additives and supply chains (FAO, 2016; FAO, 2018a; FAO, 2020). 
            </p>
            <h2 className="text-2xl font-bold text-primary !mt-12 !mb-4">Our Mission</h2>
            <p>
            The JEI tool is a simple, user-friendly calculator for computing the potential environmental impact offsets of using commercial 
            feed additives in livestock production. The intended end-users include sales personnel, technical team members, farmers, feed millers,
             and all persons with technical knowledge of animal production systems.
            </p>
            <h2 className="text-2xl font-bold text-primary !mt-12 !mb-4">The Technology</h2>
            <p>
            The JEI calculator leverages regionally specific data and physical models that characterize production performance 
            (zootechnical effect) from trials conducted over 20 years on commercial farms and in research institutions. It provides an intuitive yet
             simple pathway to exploring the potential of commercial feed additives to drive sustainable production and consumption. The additives, 
             which are fundamental to the JEI system, are designed, manufactured, and commercially distributed by Jefo Nutrition Inc. 
            </p>
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
