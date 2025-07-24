
"use client";

import * as React from "react";
import { CalculatorPageContent } from "@/components/calculator-page-content";
import { useSearchParams } from "next/navigation";
import type { OptimizationResult } from "@/lib/types";

type ResultsDisplayComponentType = React.ComponentType<{
  results: OptimizationResult | null;
  isLoading: boolean;
  error: string | null;
}>;


export function WrapperCalculatorPageContent({ ResultsDisplayComponent }: { ResultsDisplayComponent: ResultsDisplayComponentType }) {
  const searchParams = useSearchParams();
  const species = searchParams.get('species') || 'broilers';

  return <CalculatorPageContent species={species} ResultsDisplayComponent={ResultsDisplayComponent} />;
}
