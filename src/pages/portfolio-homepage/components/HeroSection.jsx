import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from 'components/ui/Button';
import AnimatedBackground from './AnimatedBackground';

const HeroSection = () => {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const taglines = [
    'Full Stack Developer',
    'Data Scientist',
    'Creative Cinematographer',
    'Design Enthusiast',
    'Problem Solver'
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadResume = () => {
    // This would typically link to an actual resume file
    const resumeUrl = '/assets/resume.pdf';
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'Muyah_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPortfolio = () => {
    const portfolioSection = document.getElementById('featured-projects');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground className="z-0" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Professional Headshot */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isVisible ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 lg:w-48 lg:h-48 mx-auto rounded-full overflow-hidden border-4 border-primary shadow-floating hover:shadow-glow transition-all duration-300">
              <img
                src="/assets/images/no_image.png"
                alt="Muyah - Professional Headshot"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* Name and Title */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isVisible ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary mb-4">
              Hi, I'm{' '}
              <span className="text-primary text-shadow-glow">Muyah</span>
            </h1>
            
            <div className="h-12 sm:h-16 flex items-center justify-center">
              <motion.h2
                key={currentTagline}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl sm:text-2xl lg:text-3xl font-medium text-accent"
              >
                {taglines[currentTagline]}
              </motion.h2>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={isVisible ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Passionate about creating innovative solutions that bridge technology and creativity. 
            I bring multidisciplinary expertise to every project, combining technical excellence 
            with creative vision to deliver exceptional results.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isVisible ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Button
              onClick={handleViewPortfolio}
              variant="primary"
              size="lg"
              iconName="FolderOpen"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200"
            >
              View My Work
            </Button>
            
            <Button
              onClick={handleDownloadResume}
              variant="outline"
              size="lg"
              iconName="Download"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200"
            >
              Download Resume
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
              className="w-6 h-10 border-2 border-primary rounded-full flex justify-center p-1"
            >
              <div className="w-1 h-2 bg-primary rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;