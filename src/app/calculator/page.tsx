"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CalculatorPage() {
  const searchParams = useSearchParams();

  return (
    <div>
      <Header />
      <div className="text-5xl h-svh">Calculator</div>
      <Footer />
    </div>
  );
}
