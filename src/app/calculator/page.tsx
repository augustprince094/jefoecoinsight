
"use client";

import { useState } from 'react';
import { OptimizerForm } from '@/components/optimizer-form';
import { ResultsDisplay } from '@/components/results-display';
import type { OptimizationResult } from '@/lib/types';
import Link from 'next/link';
import { JefoLogo } from '@/components/icons/jefo-logo';

export default function CalculatorPage() {
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              <Link href="#" className="text-muted-foreground hover:text-primary">About App</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Feed additives</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Applications</Link>
              <Link href="/calculator" className="font-semibold text-primary border-b-2 border-primary">
                  Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground tracking-tight">
            ROI & GHG Impact Calculator
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base">
            Analyze the financial and environmental benefits of feed additives in your livestock operation.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <OptimizerForm 
              setResults={setResults} 
              setIsLoading={setIsLoading} 
              setError={setError} 
              isCalculating={isLoading}
            />
          </div>
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <ResultsDisplay 
              results={results} 
              isLoading={isLoading} 
              error={error} 
            />
          </div>
        </div>
      </main>

      <footer className="bg-card/80 border-t py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-muted-foreground text-sm">
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
