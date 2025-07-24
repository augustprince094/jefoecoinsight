
"use client";

import { useSearchParams } from 'next/navigation';
import { CalculatorPageContent } from '@/components/calculator-page-content';
import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader } from './ui/card';

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

export function WrapperCalculatorPageContent() {
  const searchParams = useSearchParams();
  const species = searchParams.get('species') || 'broilers';

  return (
    <CalculatorPageContent 
      species={species}
      ResultsDisplayComponent={ResultsDisplay}
    />
  );
}
