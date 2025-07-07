import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const TechStackGrid = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredTech, setHoveredTech] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const techStacks = {
    frontend: [
      { name: 'React', icon: 'Code', level: 95, color: '#61DAFB' },
      { name: 'JavaScript', icon: 'Code', level: 90, color: '#F7DF1E' },
      { name: 'TypeScript', icon: 'Code', level: 85, color: '#3178C6' },
      { name: 'HTML5', icon: 'Code', level: 95, color: '#E34F26' },
      { name: 'CSS3', icon: 'Palette', level: 90, color: '#1572B6' },
      { name: 'Tailwind', icon: 'Palette', level: 90, color: '#06B6D4' }
    ],
    backend: [
      { name: 'Node.js', icon: 'Server', level: 85, color: '#339933' },
      { name: 'Python', icon: 'Code', level: 90, color: '#3776AB' },
      { name: 'Express', icon: 'Server', level: 80, color: '#000000' },
      { name: 'PostgreSQL', icon: 'Database', level: 85, color: '#4169E1' },
      { name: 'MongoDB', icon: 'Database', level: 80, color: '#47A248' },
      { name: 'Redis', icon: 'Database', level: 75, color: '#DC382D' }
    ],
    tools: [
      { name: 'Git', icon: 'GitBranch', level: 90, color: '#F05032' },
      { name: 'Docker', icon: 'Container', level: 80, color: '#2496ED' },
      { name: 'AWS', icon: 'Cloud', level: 75, color: '#FF9900' },
      { name: 'Figma', icon: 'Palette', level: 85, color: '#F24E1E' },
      { name: 'Photoshop', icon: 'Image', level: 80, color: '#31A8FF' },
      { name: 'Premiere', icon: 'Video', level: 85, color: '#9999FF' }
    ]
  };

  const categories = [
    { key: 'frontend', label: 'Frontend', icon: 'Monitor' },
    { key: 'backend', label: 'Backend', icon: 'Server' },
    { key: 'tools', label: 'Tools & Design', icon: 'Wrench' }
  ];

  const handleTechHover = (tech) => {
    setHoveredTech(tech);
  };

  const handleTechLeave = () => {
    setHoveredTech(null);
  };

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isVisible ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Tech Stack
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Technologies and tools I use to bring ideas to life
          </p>
        </motion.div>

        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.key}
              initial={{ y: 50, opacity: 0 }}
              animate={isVisible ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center space-x-3">
                <Icon name={category.icon} size={24} className="text-primary" />
                <h3 className="text-xl sm:text-2xl font-semibold text-text-primary">
                  {category.label}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {techStacks[category.key]?.map((tech, techIndex) => (
                  <motion.div
                    key={tech.name}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                    transition={{ 
                      duration: 0.6, 
                      delay: categoryIndex * 0.2 + techIndex * 0.1 
                    }}
                    className="group relative"
                    onMouseEnter={() => handleTechHover(tech)}
                    onMouseLeave={handleTechLeave}
                  >
                    <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-floating group-hover:bg-surface/80 cursor-pointer">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon 
                            name={tech.icon} 
                            size={24} 
                            className="text-primary group-hover:text-accent transition-colors duration-300"
                          />
                        </div>
                        <span className="text-text-primary font-medium text-sm text-center">
                          {tech.name}
                        </span>
                      </div>

                      {/* Skill Level Progress */}
                      <div className="mt-4 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Proficiency</span>
                          <span className="text-primary font-medium">{tech.level}%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={hoveredTech?.name === tech.name ? { width: `${tech.level}%` } : {}}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hover Tooltip */}
                    {hoveredTech?.name === tech.name && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-50">
                        <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-elevated animate-fade-in">
                          <p className="text-text-primary text-sm font-medium whitespace-nowrap">
                            {tech.level}% Proficiency
                          </p>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-surface border-l border-b border-border rotate-45" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackGrid;