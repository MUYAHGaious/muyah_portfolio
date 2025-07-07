import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const BioSection = () => {
  const [isVisible, setIsVisible] = useState(false);
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

  const highlights = [
    {
      icon: 'Code',
      title: 'Full Stack Development',
      description: '5+ years building scalable web applications'
    },
    {
      icon: 'Database',
      title: 'Data Science',
      description: 'Machine learning and data visualization expert'
    },
    {
      icon: 'Video',
      title: 'Cinematography',
      description: 'Creative storytelling through visual media'
    },
    {
      icon: 'Palette',
      title: 'Design',
      description: 'UI/UX design with focus on user experience'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Bio Content */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isVisible ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
                About Me
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>

            <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
              <p>
                I'm a multidisciplinary creative professional who thrives at the intersection of 
                technology and artistry. With over 5 years of experience in full-stack development, 
                I've evolved into a versatile creator who brings both technical expertise and 
                creative vision to every project.
              </p>
              
              <p>
                My journey began with a fascination for code, but it quickly expanded to encompass 
                data science, cinematography, and design. This unique combination allows me to 
                approach problems from multiple angles and create solutions that are not only 
                functional but also beautiful and engaging.
              </p>
              
              <p>
                When I'm not coding or analyzing data, you'll find me behind a camera capturing 
                stories or designing interfaces that put users first. I believe that great 
                technology should be invisible—seamlessly integrated into experiences that 
                delight and inspire.
              </p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isVisible ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-3 pt-4"
            >
              {['Passionate', 'Innovative', 'Collaborative', 'Detail-Oriented'].map((trait) => (
                <span
                  key={trait}
                  className="px-4 py-2 bg-surface border border-border rounded-full text-sm text-text-primary hover:border-primary/50 transition-colors duration-200"
                >
                  {trait}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Highlights Grid */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={isVisible ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ y: 20, opacity: 0 }}
                animate={isVisible ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="group"
              >
                <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-floating group-hover:bg-surface/80">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon 
                        name={highlight.icon} 
                        size={24} 
                        className="text-primary group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-text-primary font-semibold text-lg">
                      {highlight.title}
                    </h3>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BioSection;