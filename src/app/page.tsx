"use client"

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Download } from 'lucide-react';
import { JefoLogo } from '@/components/icons/jefo-logo';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"


const livestockData = [
  {
    species: "Poultry",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjaGlja2Vuc3xlbnwwfHx8fDE3NTA5NzAxOTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Chickens in a grassy field, representing sustainable poultry farming.",
    dataAiHint: "chickens field",
    headline: "See how Jefo feed additives can help you reduce your carbon footprint in broiler production",
    downloadLink: "/lca-poultry.pdf"
  },
  {
    species: "PIGS",
    image: "https://images.unsplash.com/photo-1548781712-3da7f1a9dcd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8cGlnJTIwcHJvZHVjdGlvbnxlbnwwfHx8fDE3NTA5Njk5ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Pigs on a sustainable farm.",
    dataAiHint: "pigs farm",
    headline: "Discover the environmental benefits for pig production with Jefo solutions",
    downloadLink: "/lca-swine.pdf"
  },
  {
    species: "Dairy",
    image: "https://images.unsplash.com/photo-1636998980792-63f27ddea4e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxkYWlyeSUyMGNvd3xlbnwwfHx8fDE3NTA5NzAwODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Dairy cows in a field, representing a sustainable dairy operation.",
    dataAiHint: "dairy cows",
    headline: "Lower the carbon footprint of your dairy operation with our innovative feed additives",
    downloadLink: "/lca-dairy.pdf"
  },
]


export default function HomePage() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  )

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <JefoLogo className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-primary">Jefo EcoInsight</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="#" className="text-muted-foreground hover:text-primary">About App</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Feed additives</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Applications</Link>
              <Link href="/calculator" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                  Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 items-center">
              <div className="text-center">
                 <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  Lower your carbon footprint with Jefo solutions
                </h1>
                <p className="text-muted-foreground mb-8">
                  Incorporating the protected organic acid and essential oils could lower your carbon footprint by -4.8%
                </p>
                <div className="text-center">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/calculator">Calculate your savings</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Solution Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">A Simple solution with tangible results</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
              Watch how Jefo feed additives can reduce the environmental impact of livestock farming.
            </p>
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0 relative bg-black">
                <video
                  controls
                  poster="https://placehold.co/960x540.png"
                  className="w-full"
                  data-ai-hint="farm video"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Download Section */}
        <section className="py-12 md:py-20">
           <div className="container mx-auto px-4">
            <Card>
              <CardContent className="p-8">
                <Carousel
                  plugins={[plugin.current]}
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {livestockData.map((item, index) => (
                      <CarouselItem key={index}>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                           <div className="text-center md:text-left">
                              <h2 className="text-2xl md:text-3xl font-bold mb-4">{item.headline}</h2>
                              <Button asChild size="lg" variant="outline">
                                <a href={item.downloadLink} download>
                                  <Download className="mr-2" />
                                  Download the Life Cycle Assessment
                                </a>
                              </Button>
                            </div>
                          <div>
                            <Image
                              src={item.image}
                              alt={item.alt}
                              width={500}
                              height={300}
                              className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[5/3]"
                              data-ai-hint={item.dataAiHint}
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex" />
                  <CarouselNext className="hidden md:flex"/>
                </Carousel>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card/80 border-t py-8">
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
