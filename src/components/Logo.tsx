import React from 'react';
import { Building } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: {
      container: 'flex items-center space-x-4 space-x-reverse',
      icon: 'h-4 w-4',
      iconContainer: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white p-1 rounded shadow-sm',
      text: 'text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
    },
    medium: {
      container: 'flex items-center space-x-5 space-x-reverse',
      icon: 'h-5 w-5',
      iconContainer: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white p-1.5 rounded-md shadow-sm',
      text: 'text-base font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
    },
    large: {
      container: 'flex items-center space-x-6 space-x-reverse',
      icon: 'h-6 w-6',
      iconContainer: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-lg shadow-md',
      text: 'text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`${currentSize.container} ${className}`}>
      <div className={currentSize.iconContainer}>
        <Building className={currentSize.icon} />
      </div>
    </div>
  );
};

export default Logo;
