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
  // Increase threshold for smoother trigger
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.7 });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

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
