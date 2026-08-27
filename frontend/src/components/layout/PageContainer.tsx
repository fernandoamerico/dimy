import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

export function PageContainer({ 
  children, 
  className = '', 
  maxWidth = '6xl' 
}: PageContainerProps) {
  const maxWidthClass = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'w-full',
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto space-y-8 animate-in fade-in duration-500 ${className}`}>
      {children}
    </div>
  );
}
