export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Neon glow effect behind title */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-neon-purple/30 rounded-full scale-150" />
        <h1 className="relative text-6xl font-bold text-white text-neon-glow mb-4">
          Open Consultant
        </h1>
      </div>

      <p className="text-xl text-gray-400 mb-8">
        Your AI-powered consulting assistant
      </p>

      {/* Neon card example */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-neon rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-neon-pulse" />
        <div className="relative bg-dark-800 border border-neon-purple/30 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-neon-purple mb-4">
            Get Started
          </h2>
          <p className="text-gray-300 mb-6">
            Build something amazing with Next.js, Tailwind CSS, and a stunning dark neon aesthetic.
          </p>
          <button className="px-6 py-3 bg-neon-purple/20 border border-neon-purple text-neon-purple rounded-lg hover:bg-neon-purple hover:text-white transition-all duration-300 shadow-neon hover:shadow-neon-lg">
            Launch App
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
        {[
          { title: "Fast", desc: "Optimized for speed and performance" },
          { title: "Modern", desc: "Built with the latest technologies" },
          { title: "Beautiful", desc: "Stunning dark neon aesthetics" },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-dark-800 border border-neon-purple/20 rounded-lg p-6 hover:border-neon-purple/50 transition-colors duration-300"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}