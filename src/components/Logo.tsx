import React from 'react';
import { Building } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: {
      container: 'flex items-center space-x-2 space-x-reverse',
      icon: 'h-8 w-8',
      iconContainer: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-lg shadow-md',
      text: 'text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent',
      domain: 'text-xs text-gray-500 mt-0.5'
    },
    medium: {
      container: 'flex items-center space-x-3 space-x-reverse',
      icon: 'h-10 w-10',
      iconContainer: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 rounded-xl shadow-lg',
      text: 'text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent',
      domain: 'text-sm text-gray-500 mt-1'
    },
    large: {
      container: 'flex items-center space-x-4 space-x-reverse',
      icon: 'h-12 w-12',
      iconContainer: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-2xl shadow-xl',
      text: 'text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent',
      domain: 'text-base text-gray-600 mt-1'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`${currentSize.container} ${className}`}>
      <div className={currentSize.iconContainer}>
        <Building className={currentSize.icon} />
      </div>
      <div className="flex flex-col">
        <h1 className={currentSize.text}>
          اي ايجار
        </h1>
        <span className={currentSize.domain}>
          e-egar.com
        </span>
      </div>
    </div>
  );
};

export default Logo;
