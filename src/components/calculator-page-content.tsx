
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { OptimizerForm } from '@/components/optimizer-form';
import type { OptimizationResult } from '@/lib/types';
import Link from 'next/link';
import { JefoLogo } from '@/components/icons/jefo-logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the ResultsDisplay component to optimize initial page load
const ResultsDisplay = dynamic(
  () => import('@/components/results-display').then((mod) => mod.ResultsDisplay),
  {
    ssr: false, // This component uses recharts which is client-side only
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    ),
  }
);


export function CalculatorPageContent({ species }: { species: string }) {
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
              <Link href="/about" className="text-muted-foreground hover:text-primary">About App</Link>
              <Link href="/feed-additives" className="text-muted-foreground hover:text-primary">Feed additives</Link>
              <Link href="/species-selection" className="font-semibold text-primary border-b-2 border-primary">
                  Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            GHG Impact & ROI Calculator for {species.charAt(0).toUpperCase() + species.slice(1)}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base">
            Analyze the environmental and financial benefits of Jefo feed additives in your livestock operation.
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
