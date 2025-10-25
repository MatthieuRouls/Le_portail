import { motion } from 'framer-motion';

export default function PortalVortex() {
  return (
    <div style={{ position: 'relative', width: '20rem', height: '20rem', margin: '0 auto', pointerEvents: 'none' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: '2px solid',
            borderColor: `rgba(${230 - i * 30}, ${57 + i * 20}, ${70 + i * 20}, ${0.4 - i * 0.05})`,
            margin: `${i * 20}px`,
          }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 20 - i * 2,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}
      
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: '8rem',
          height: '8rem',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, rgba(230,57,70,0.8) 0%, rgba(114,9,183,0.4) 50%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`bolt-${i}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '0.125rem',
            height: '5rem',
            backgroundColor: '#f87171',
            transformOrigin: 'top',
            transform: `rotate(${i * 90}deg)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scaleY: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
