import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { PigIcon } from "@/components/icons/pig-icon";
import { CowIcon } from "@/components/icons/cow-icon";
import { HenIcon } from "@/components/icons/hen-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const speciesList = [
  {
    name: "Broilers",
    icon: <HenIcon className="h-10 w-10 text-primary" />,
    description:
      "Optimize your poultry production for sustainability and profitability.",
    link: "/calculator?species=broilers",
    enabled: true,
  },
  {
    name: "Swine",
    icon: <PigIcon className="h-10 w-10 text-muted-foreground" />,
    description: "Coming soon: GHG and ROI calculations for pig farming.",
    link: "#",
    enabled: false,
  },
  {
    name: "Dairy",
    icon: <CowIcon className="h-10 w-10 text-muted-foreground" />,
    description: "Coming soon: Insights for sustainable dairy operations.",
    link: "#",
    enabled: false,
  },
];

export default function SpeciesSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                Select a Species to Begin
              </h1>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Choose a livestock type to analyze its sustainability profile
                and financial returns with Jefo solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {speciesList.map((species) => (
                <Card
                  key={species.name}
                  className={`flex flex-col text-center transition-all ${!species.enabled ? "bg-muted/50" : "hover:shadow-lg hover:-translate-y-1"}`}
                >
                  <CardHeader className="items-center">
                    {species.icon}
                    <CardTitle
                      className={`text-2xl ${!species.enabled ? "text-muted-foreground" : "text-primary"}`}
                    >
                      {species.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <p
                      className={`text-muted-foreground mb-6 ${!species.enabled ? "" : "text-foreground/80"}`}
                    >
                      {species.description}
                    </p>
                    <Button
                      asChild
                      disabled={!species.enabled}
                      variant={species.enabled ? "default" : "secondary"}
                    >
                      <Link href={species.link}>
                        {species.enabled ? "Start Calculating" : "Coming Soon"}
                        {species.enabled && (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
