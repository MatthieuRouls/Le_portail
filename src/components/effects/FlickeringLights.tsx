import { motion } from 'framer-motion';

export default function FlickeringLights() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="absolute inset-0 bg-white"
        animate={{
          opacity: [0, 0.1, 0, 0.15, 0, 0.05, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          times: [0, 0.1, 0.15, 0.3, 0.4, 0.6, 1],
        }}
      />
    </div>
  );
}
