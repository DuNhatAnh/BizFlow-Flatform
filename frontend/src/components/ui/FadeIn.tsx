import React, { useEffect, useState } from 'react';

interface FadeInProps extends React.HTMLAttributes<HTMLElement> {
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds
  as?: React.ElementType; // Element type to render
}

export function FadeIn({ children, className = '', delay = 0, duration = 500, as: Component = 'div', ...props }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Component
      className={`${className} transition-all ease-out`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transitionDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
