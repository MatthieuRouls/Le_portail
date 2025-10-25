import { motion } from 'framer-motion';

interface PortalGaugeProps {
  level: number;
  maxLevel?: number;
}

export default function PortalGauge({ level, maxLevel = 20 }: PortalGaugeProps) {
  const percentage = (level / maxLevel) * 100;
  const isDangerous = percentage > 70;
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 'bold', fontFamily: 'monospace' }}>LE PORTAIL</span>
        <motion.span 
          style={{ 
            fontSize: '0.875rem', 
            fontFamily: 'monospace',
            color: isDangerous ? '#ef4444' : '#d1d5db'
          }}
          animate={isDangerous ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {level}/{maxLevel}
        </motion.span>
      </div>
      
      <div style={{ position: 'relative', height: '2rem', backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '9999px', overflow: 'hidden', border: '2px solid rgba(127, 29, 29, 0.5)', boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' }}>
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            background: 'linear-gradient(to right, #dc2626, #ef4444, #f87171)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
        
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.3)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', borderLeft: '2px solid rgba(127, 29, 29, 0.3)' }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
        <span style={{ color: '#10b981', fontFamily: 'monospace' }}>◉ FERMÉ</span>
        <span style={{ color: '#ef4444', fontFamily: 'monospace', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>⚠ OUVERT</span>
      </div>
    </div>
  );
}
