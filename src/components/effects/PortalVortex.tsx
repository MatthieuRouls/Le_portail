import { motion } from 'framer-motion';

export default function PortalVortex() {
  return (
    <div className="relative w-80 h-80 mx-auto pointer-events-none">
      {/* Anneaux rotatifs avec dégradé cyan vers violet */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        // Interpolation de couleur entre cyan et violet
        const cyanAmount = 1 - i / 5;
        const violetAmount = i / 5;

        return (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid',
              borderColor: `rgba(0, 212, 255, ${0.4 * cyanAmount})`,
              boxShadow: `0 0 ${20 - i * 2}px rgba(0, 212, 255, ${0.3 * cyanAmount}),
                          inset 0 0 ${15 - i * 2}px rgba(139, 92, 246, ${0.3 * violetAmount})`,
              margin: `${i * 18}px`,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [1, 1.03, 1],
            }}
            transition={{
              rotate: {
                duration: 25 - i * 3,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        );
      })}

      {/* Noyau central avec gradient cyan-violet */}
      <motion.div
        className="absolute inset-0 m-auto w-32 h-32 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 212, 255, 0.9) 0%, rgba(139, 92, 246, 0.6) 40%, rgba(109, 40, 217, 0.3) 70%, transparent 100%)',
          filter: 'blur(2px)',
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Éclairs d'énergie avec alternance cyan/violet */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={`bolt-${i}`}
          className="absolute top-1/2 left-1/2 origin-top"
          style={{
            width: '2px',
            height: '6rem',
            background:
              i % 2 === 0
                ? 'linear-gradient(to bottom, #00d4ff, transparent)'
                : 'linear-gradient(to bottom, #8b5cf6, transparent)',
            transform: `rotate(${i * 45}deg)`,
            boxShadow:
              i % 2 === 0
                ? '0 0 10px rgba(0, 212, 255, 0.8)'
                : '0 0 10px rgba(139, 92, 246, 0.8)',
          }}
          animate={{
            opacity: [0, 1, 0],
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 1.5,
            delay: i * 0.15,
          }}
        />
      ))}

      {/* Particules orbitales */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 2 === 0 ? '#00d4ff' : '#8b5cf6',
            boxShadow:
              i % 2 === 0
                ? '0 0 8px rgba(0, 212, 255, 0.8)'
                : '0 0 8px rgba(139, 92, 246, 0.8)',
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: [
              0,
              Math.cos((i * 60 * Math.PI) / 180) * 100,
              Math.cos(((i * 60 + 180) * Math.PI) / 180) * 100,
              0,
            ],
            y: [
              0,
              Math.sin((i * 60 * Math.PI) / 180) * 100,
              Math.sin(((i * 60 + 180) * Math.PI) / 180) * 100,
              0,
            ],
            scale: [1, 1.5, 1, 1],
            opacity: [0.5, 1, 0.5, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Effet de distorsion atmosphérique */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle, transparent 30%, rgba(0, 212, 255, 0.1) 50%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
