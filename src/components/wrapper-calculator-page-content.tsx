
"use client";

import { CalculatorPageContent } from "@/components/calculator-page-content";
import { useSearchParams } from "next/navigation";

export function WrapperCalculatorPageContent() {
  const searchParams = useSearchParams();
  const species = searchParams.get('species') || 'broilers';

  return <CalculatorPageContent species={species} />;
}
