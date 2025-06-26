"use client";

import { useState } from 'react';
import { OptimizerForm } from '@/components/optimizer-form';
import { ResultsDisplay } from '@/components/results-display';
import type { OptimizationResult } from '@/lib/types';
import { Leaf } from 'lucide-react';

export default function Home() {
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold font-headline text-primary-foreground tracking-tight">
                Livestock Optimizer
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary-foreground tracking-tight">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Livestock ROI & GHG Optimizer. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
