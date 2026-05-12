import Link from 'next/link';
import { Leaf, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 flex justify-between items-center border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary" />
          <h1 className="text-2xl font-bold text-primary tracking-tight">Annadata</h1>
        </div>
        <Link href="/intake" className="text-sm font-semibold text-primary hover:underline">
          Join the Pilot
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-5xl font-extrabold text-primary mb-6 tracking-tight leading-tight">
          Bridging the 16% Value Gap
        </h2>
        <p className="text-lg text-primary/80 mb-10 max-w-2xl">
          Recognizing the unrecognized hardship, social contribution, and environmental stewardship of farmers through Annadata Impact Credits (AIC).
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            href="/intake" 
            className="flex items-center justify-center gap-2 bg-primary text-accent px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Start Intake Flow <ArrowRight size={20} />
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-2 bg-accent text-primary px-8 py-4 rounded-full font-bold hover:bg-accent/80 transition-colors shadow-lg"
          >
            View Trust Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
