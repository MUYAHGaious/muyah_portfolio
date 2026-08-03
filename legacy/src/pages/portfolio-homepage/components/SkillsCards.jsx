import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const SkillsCards = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
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

  const skillCategories = [
    {
      id: 'fullstack',
      title: 'Full Stack Development',
      icon: 'Code',
      color: 'primary',
      description: 'Building end-to-end web applications with modern technologies',
      skills: [
        'React & Next.js',
        'Node.js & Express',
        'Database Design',
        'API Development',
        'DevOps & Deployment',
        'Performance Optimization'
      ],
      highlights: [
        '5+ years experience',
        '20+ projects delivered',
        'Scalable architecture'
      ]
    },
    {
      id: 'datascience',
      title: 'Data Science',
      icon: 'Database',
      color: 'accent',
      description: 'Extracting insights from complex datasets using advanced analytics',
      skills: [
        'Python & R',
        'Machine Learning',
        'Data Visualization',
        'Statistical Analysis',
        'Neural Networks',
        'Big Data Processing'
      ],
      highlights: [
        'ML model deployment',
        'Predictive analytics',
        'Data storytelling'
      ]
    },
    {
      id: 'cinematography',
      title: 'Cinematography',
      icon: 'Video',
      color: 'success',
      description: 'Creating compelling visual narratives through film and video',
      skills: [
        'Camera Operation',
        'Lighting Design',
        'Color Grading',
        'Post-Production',
        'Storytelling',
        'Equipment Management'
      ],
      highlights: [
        'Award-winning films',
        'Commercial projects',
        'Creative direction'
      ]
    },
    {
      id: 'design',
      title: 'Design',
      icon: 'Palette',
      color: 'warning',
      description: 'Crafting user-centered experiences with attention to detail',
      skills: [
        'UI/UX Design',
        'Figma & Adobe Suite',
        'Prototyping',
        'User Research',
        'Brand Identity',
        'Design Systems'
      ],
      highlights: [
        'User-first approach',
        'Accessibility focused',
        'Brand consistency'
      ]
    }
  ];

  const handleCardHover = (cardId) => {
    setActiveCard(cardId);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'border-primary/30 hover:border-primary/50 hover:bg-primary/5',
      accent: 'border-accent/30 hover:border-accent/50 hover:bg-accent/5',
      success: 'border-success/30 hover:border-success/50 hover:bg-success/5',
      warning: 'border-warning/30 hover:border-warning/50 hover:bg-warning/5'
    };
    return colorMap[color] || colorMap.primary;
  };

  const getIconColor = (color) => {
    const colorMap = {
      primary: 'text-primary',
      accent: 'text-accent',
      success: 'text-success',
      warning: 'text-warning'
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isVisible ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Skills & Expertise
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Multidisciplinary expertise across technology, creativity, and innovation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ y: 50, opacity: 0 }}
              animate={isVisible ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
              onMouseEnter={() => handleCardHover(category.id)}
              onMouseLeave={handleCardLeave}
            >
              <div className={`bg-surface border rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-floating cursor-pointer ${getColorClasses(category.color)}`}>
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${category.color === 'primary' ? 'bg-primary/10 group-hover:bg-primary/20' : category.color === 'accent' ? 'bg-accent/10 group-hover:bg-accent/20' : category.color === 'success' ? 'bg-success/10 group-hover:bg-success/20' : 'bg-warning/10 group-hover:bg-warning/20'}`}>
                    <Icon 
                      name={category.icon} 
                      size={28} 
                      className={`${getIconColor(category.color)} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-1">
                      {category.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    {category.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={skill}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.2 + skillIndex * 0.1 
                        }}
                        className="flex items-center space-x-2"
                      >
                        <div className={`w-2 h-2 rounded-full ${category.color === 'primary' ? 'bg-primary' : category.color === 'accent' ? 'bg-accent' : category.color === 'success' ? 'bg-success' : 'bg-warning'} group-hover:scale-125 transition-transform duration-300`} />
                        <span className="text-text-primary text-sm font-medium">
                          {skill}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-text-secondary text-xs font-medium uppercase tracking-wide">
                    Key Highlights
                  </h4>
                  <div className="space-y-2">
                    {category.highlights.map((highlight, highlightIndex) => (
                      <motion.div
                        key={highlight}
                        initial={{ x: -20, opacity: 0 }}
                        animate={activeCard === category.id ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.3, delay: highlightIndex * 0.1 }}
                        className="flex items-center space-x-2"
                      >
                        <Icon 
                          name="CheckCircle" 
                          size={14} 
                          className={`${getIconColor(category.color)} flex-shrink-0`}
                        />
                        <span className="text-text-secondary text-sm">
                          {highlight}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsCards;