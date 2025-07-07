import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';

const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search projects...",
  isVisible = true 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    onSearchChange?.('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative max-w-md mx-auto lg:mx-0"
    >
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon 
            name="Search" 
            size={18} 
            className={`transition-colors duration-200 ${
              isFocused ? 'text-primary' : 'text-text-secondary'
            }`}
          />
        </div>

        {/* Search Input */}
        <Input
          type="text"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            pl-10 pr-10 h-12 w-full rounded-xl border-2 transition-all duration-200
            focus:border-primary focus:ring-2 focus:ring-primary/20
            ${isFocused ? 'border-primary' : 'border-border'}
          `}
        />

        {/* Clear Button */}
        {localSearchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-hover transition-colors duration-200"
            aria-label="Clear search"
          >
            <Icon name="X" size={16} className="text-text-secondary hover:text-text-primary" />
          </motion.button>
        )}
      </div>

      {/* Search Results Indicator */}
      {localSearchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 left-0 text-xs text-text-secondary"
        >
          Searching for "{localSearchTerm}"...
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;