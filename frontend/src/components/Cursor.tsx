import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const Cursor = () => {
  const cursorRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsActive(true);
      }
    };
    const handleMouseOut = (_e: MouseEvent) => {
      setIsActive(false);
    };
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <motion.div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 50,
        x: springX,
        y: springY,
        width: isActive ? 56 : 32,
        height: isActive ? 56 : 32,
        background: isActive ? 'rgba(255, 71, 71, 0.15)' : 'rgba(255,255,255,0.15)',
        border: isActive ? '2px solid #ff4747' : '2px solid #333',
        borderRadius: '50%',
        mixBlendMode: 'difference',
        transition: 'background 0.2s, border 0.2s',
        boxShadow: isActive ? '0 0 16px 4px #ff4747' : '0 0 8px 2px #333',
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={{
        scale: isActive ? 1.2 : 1,
      }}
    >
      <motion.svg
        width={isActive ? 32 : 20}
        height={isActive ? 32 : 20}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ rotate: 0 }}
        animate={{ rotate: isActive ? 10 : 0, y: isActive ? -2 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Simple truck icon for logistics */}
        <rect x="4" y="12" width="18" height="8" rx="2" fill="#ff4747" />
        <rect x="22" y="16" width="6" height="4" rx="1" fill="#ff4747" />
        <circle cx="8" cy="22" r="2" fill="#333" />
        <circle cx="24" cy="22" r="2" fill="#333" />
        <rect x="7" y="14" width="8" height="2" rx="1" fill="#fff" />
      </motion.svg>
    </motion.div>
  );
};

export default Cursor;
