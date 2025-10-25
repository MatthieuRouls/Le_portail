import { useState, useEffect } from 'react';

export default function StaticNoise() {
  const [opacity, setOpacity] = useState(0.03);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(Math.random() * 0.05 + 0.02);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40 mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        opacity: opacity,
      }}
    />
  );
}
