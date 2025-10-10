import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  scale?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, delay = 0, y = 40, scale = 0.98 }) => {
  const controls = useAnimation();
  // Use lower threshold for mobile devices to ensure content shows
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [ref, inView] = useInView({ 
    triggerOnce: true, 
    threshold: isMobile ? 0.1 : 0.3,
    rootMargin: isMobile ? '-10px 0px' : '-50px 0px'
  });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
    
    // Mobile fallback: Show content immediately on mobile if no animation
    if (isMobile && y === 0 && scale === 1) {
      controls.start('visible');
    }
  }, [controls, inView, isMobile, y, scale]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y, scale },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
            delay,
          },
        },
      }}
      // Removed willChange for smoother browser behavior
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
