import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-3xl text-center space-y-8 animate-fade-in">
          <h1 className="font-display text-display-lg text-foreground text-balance">
            Your Legacy, Protected
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
            A secure space to leave messages, memories, and wishes for your loved ones.
            Revealed only when the time comes.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Link
              href="/register"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="border border-border/60 text-foreground rounded-xl px-8 py-4 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-display-sm text-foreground text-center mb-16">
            What you can preserve
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Letters & Messages"
              description="Write heartfelt letters to be delivered at the right moment."
            />
            <FeatureCard
              title="Photos & Videos"
              description="Share precious memories and moments that matter most."
            />
            <FeatureCard
              title="Final Wishes"
              description="Document your wishes and important instructions."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-display text-display-sm text-foreground">
            Built on trust
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your keepsakes are encrypted end-to-end. Only your designated beneficiaries
            can access them, and only when the conditions you set are met.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <span className="font-display">Beyond</span>
          <span>A secure digital legacy platform</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8 transition-shadow duration-200 ease-out hover:shadow-soft-md">
      <h3 className="font-display text-xl text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
