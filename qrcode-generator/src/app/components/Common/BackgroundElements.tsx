export default function BackgroundElements() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute top-0 left-[10%] w-64 h-64 bg-rich-gold/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl transform translate-y-1/2"></div>
      <div className="absolute top-1/3 right-[15%] w-48 h-48 bg-rich-gold/5 rounded-full blur-2xl"></div>
    </div>
  );
}
