
import Link from 'next/link';
import { JefoLogo } from '@/components/icons/jefo-logo';

export default function AboutPage() {
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
              <Link href="/about" className="font-semibold text-primary border-b-2 border-primary">About App</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Feed additives</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">Applications</Link>
              <Link href="/calculator" className="text-muted-foreground hover:text-primary">
                  Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              About Jefo EcoInsight
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Empowering sustainable livestock production through data-driven decisions.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground/90">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
            </p>
            <p>
              Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam.
            </p>
            <h2 className="text-2xl font-bold text-primary !mt-12 !mb-4">Our Mission</h2>
            <p>
              Nam euismod tellus id magna. Praesent laoreet ante tempor urna. In hac habitasse platea dictumst. In est. Sed nec metus. Vivamus vel sapien. Integer sit amet risus. Nunc eleifend, urna nec iaculis getClass, nunc nulla scelerisque pede, eget ultrices diam eros vitae elit. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna.
            </p>
            <h2 className="text-2xl font-bold text-primary !mt-12 !mb-4">The Technology</h2>
            <p>
              Vestibulum erat nulla, ullamcorper nec, rutrum non, nonummy ac, erat. Duis ac turpis. Integer rutrum ante eu lacus. Quisque nulla. Vestibulum libero nisl, porta vel, scelerisque eget, malesuada at, neque. Vivamus eget nibh. Etiam cursus leo vel metus. Nulla facilisi. Aenean nec eros. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Suspendisse sollicitudin velit sed leo.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-card/80 border-t py-6 mt-16">
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
