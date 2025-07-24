
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { JefoLogo } from '@/components/icons/jefo-logo';
import { WrapperCalculatorPageContent } from '@/components/wrapper-calculator-page-content';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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


function CalculatorLoading() {
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
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-1/2 mx-auto mt-3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CalculatorLoading />}>
      <WrapperCalculatorPageContent ResultsDisplayComponent={ResultsDisplay} />
    </Suspense>
  );
}
