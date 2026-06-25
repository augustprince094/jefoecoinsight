"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { abstractData, livestockData } from "@/data";

export default function HomePage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const heroPlugin = useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true, stopOnMouseEnter: true }),
  );
  const downloadPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header />

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
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Incorporating the protected organic acid and essential oils
                  could lower your carbon footprint by -4.8%. Discover how our
                  research leads to tangible results.
                </p>

                <div className="max-w-2xl mx-auto mb-8">
                  <Carousel
                    setApi={setApi}
                    plugins={[heroPlugin.current]}
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {abstractData.map((item, index) => (
                        <CarouselItem key={index}>
                          <Card className="overflow-hidden">
                            <CardContent className="flex flex-col items-center justify-center p-6 aspect-video bg-background">
                              <Image
                                src={item.image}
                                alt={item.alt}
                                width={200}
                                height={120}
                                className="rounded-md object-cover mb-4 shadow-md"
                                data-ai-hint={item.dataAiHint}
                              />
                              <h3 className="font-semibold text-foreground text-base">
                                {item.title}
                              </h3>
                              <p className="text-xs text-muted-foreground text-center max-w-xs">
                                {item.description}
                              </p>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: count }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`h-2 w-2 rounded-full transition-colors ${current === index ? "bg-primary" : "bg-muted"}`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/species-selection">
                      Calculate your savings
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Solution Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              A Simple solution with tangible results
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
              Watch how Jefo feed additives can reduce the environmental impact
              of livestock farming.
            </p>
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0 relative bg-black">
                <video
                  controls
                  poster="https://placehold.co/960x540.png"
                  className="w-full"
                  data-ai-hint="farm video"
                >
                  <source
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    type="video/mp4"
                  />
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
                  plugins={[downloadPlugin.current]}
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
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                              {item.headline}
                            </h2>
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
                  <CarouselNext className="hidden md:flex" />
                </Carousel>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
