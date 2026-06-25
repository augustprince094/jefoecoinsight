import Link from "next/link";

import { JefoLogo } from "@/components/icons/jefo-logo";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              About Jefo EcoInsight
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Empowering sustainable livestock production through data-driven
              decisions.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground/90">
            <p>
              The Jefo Eco-insight (JEI) system is built to provides an estimate
              and comparable analyses and insights into environmental impacts,
              feed additive interventions, and improvements throughout the
              livestock value chain. The system complies with internationally
              recognized Food and Agricultural Organization&apos;s Livestock
              Environmental Assessment and Performance guidelines for feed
              additives and supply chains (FAO, 2016; FAO, 2018a; FAO, 2020).
            </p>
            <h2 className="text-2xl font-bold text-primary !mt-12 !mb-4">
              Our Mission
            </h2>
            <p>
              The JEI tool is a simple, user-friendly calculator for computing
              the potential environmental impact offsets of using commercial
              feed additives in livestock production. The intended end-users
              include sales personnel, technical team members, farmers, feed
              millers, and all persons with technical knowledge of animal
              production systems.
            </p>
            <h2 className="text-2xl font-bold text-primary !mt-12 !mb-4">
              The Technology
            </h2>
            <p>
              The JEI calculator leverages regionally specific data and physical
              models that characterize production performance (zootechnical
              effect) from trials conducted over 20 years on commercial farms
              and in research institutions. It provides an intuitive yet simple
              pathway to exploring the potential of commercial feed additives to
              drive sustainable production and consumption. The additives, which
              are fundamental to the JEI system, are designed, manufactured, and
              commercially distributed by Jefo Nutrition Inc.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
