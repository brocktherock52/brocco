/**
 * Fixed background decoration. Single fixed-position layer with GPU compositing,
 * isolated paint context, so it does not invalidate during scroll.
 */
export function BgDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        transform: 'translateZ(0)',
        contain: 'paint',
        willChange: 'transform',
        backgroundImage: [
          'radial-gradient(900px 500px at 50% -200px, rgba(124, 58, 237, 0.16), transparent 60%)',
          'radial-gradient(700px 400px at 90% 10%, rgba(34, 211, 238, 0.07), transparent 60%)',
          'radial-gradient(1200px 800px at 50% 110%, rgba(124, 58, 237, 0.06), transparent 70%)',
        ].join(', '),
        backgroundColor: '#0A0A0F',
      }}
    />
  );
}
