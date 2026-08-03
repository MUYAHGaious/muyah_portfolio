import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const FilterChips = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  projectCounts,
  isVisible = true 
}) => {
  const allCategories = [
    { id: 'all', label: 'All Projects', icon: 'Grid' },
    { id: 'data', label: 'Data', icon: 'Database' },
    { id: 'web', label: 'Web', icon: 'Globe' },
    { id: 'design', label: 'Design', icon: 'Palette' },
    { id: 'film', label: 'Film', icon: 'Video' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start"
    >
      {allCategories.map((category) => {
        const isActive = activeCategory === category.id;
        const count = projectCounts?.[category.id] || 0;
        
        return (
          <motion.button
            key={category.id}
            variants={chipVariants}
            onClick={() => onCategoryChange(category.id)}
            className={`
              inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border hover:border-primary/30'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon 
              name={category.icon} 
              size={16} 
              className={isActive ? 'text-primary-foreground' : 'text-text-secondary'} 
            />
            <span>{category.label}</span>
            {count > 0 && (
              <span className={`
                ml-1 px-2 py-0.5 text-xs rounded-full
                ${isActive 
                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                  : 'bg-text-secondary/10 text-text-secondary'
                }
              `}>
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default FilterChips;