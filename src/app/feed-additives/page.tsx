import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JefoLogo } from "@/components/icons/jefo-logo";

import { additives } from "@/data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function FeedAdditivesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Jefo Feed Additive Solutions
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Discover the science and sustainable impact behind Jefo&apos;s
              innovative feed additives.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8">
            {additives.map((additive) => (
              <Card key={additive.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    {additive.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div>
                    <CardDescription className="text-base text-foreground/80 mb-6">
                      {additive.lcaSummary}
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline">
                    <a
                      href={additive.paperLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Published Paper
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
