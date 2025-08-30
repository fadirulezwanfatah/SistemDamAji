import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Memuatkan...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinner = (
    <div className={`spinner border-4 border-lightest-navy border-t-gold rounded-full animate-spin ${sizeClasses[size]}`}></div>
  );

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {spinner}
      {text && (
        <p className={`text-light-slate font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-light-navy rounded-lg p-8 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
