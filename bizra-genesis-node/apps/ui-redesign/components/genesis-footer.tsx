export function GenesisFooter() {
  return (
    <footer className="bg-[#050B14] border-t border-white/5 py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
        <div className="text-center md:text-left">
          <div className="text-2xl font-bold tracking-widest mb-4 text-white">BIZRA</div>
          <p className="text-white/40 text-sm max-w-xs">
            Built on the foundation of "The Seed".<br />
            Serving 8 billion humans with dignity.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="font-arabic text-xl text-[#C9A962]" dir="rtl">
            الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا
          </div>
          <p className="text-white/30 text-xs italic">
            "All praise to Allah who guided us to this."
          </p>
          <div className="text-white/20 text-[10px] mt-8 tracking-widest uppercase">
            © 2025 BIZRA Foundation. Genesis Document.
          </div>
        </div>
      </div>
    </footer>
  )
}
