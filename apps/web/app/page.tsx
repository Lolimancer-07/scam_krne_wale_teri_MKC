export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-6 text-primary">ScamShield</h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered scam message detector. Paste any suspicious message to analyze it instantly.
        </p>
        {/* AnalyzeForm component will go here */}
        <div className="rounded-lg border bg-card p-8 text-left">
          <p className="text-muted-foreground text-sm">
            Analyze form — to be implemented by the web agent.
          </p>
        </div>
      </div>
    </main>
  );
}
