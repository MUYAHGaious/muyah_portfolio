import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const FeaturedProjects = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);

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

  useEffect(() => {
    if (isAutoPlay && isVisible) {
      intervalRef.current = setInterval(() => {
        setCurrentProject((prev) => (prev + 1) % featuredProjects.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlay, isVisible]);

  const featuredProjects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      category: 'Full Stack Development',
      description: 'A modern e-commerce solution built with React, Node.js, and PostgreSQL featuring real-time inventory management and payment processing.',
      image: '/assets/images/no_image.png',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
      features: [
        'Real-time inventory tracking',
        'Secure payment processing',
        'Admin dashboard',
        'Mobile responsive design'
      ],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      stats: {
        users: '10K+',
        performance: '95%',
        uptime: '99.9%'
      }
    },
    {
      id: 2,
      title: 'Data Analytics Dashboard',
      category: 'Data Science',
      description: 'Interactive dashboard for visualizing complex datasets with machine learning insights and predictive analytics capabilities.',
      image: '/assets/images/no_image.png',
      technologies: ['Python', 'TensorFlow', 'React', 'D3.js', 'AWS'],
      features: [
        'Interactive data visualization',
        'Machine learning predictions',
        'Real-time data processing',
        'Automated reporting'
      ],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      stats: {
        datasets: '50+',
        accuracy: '94%',
        insights: '1000+'
      }
    },
    {
      id: 3,
      title: 'Brand Documentary',
      category: 'Cinematography',
      description: 'Award-winning documentary showcasing innovative startups, featuring cinematic storytelling and professional production quality.',
      image: '/assets/images/no_image.png',
      technologies: ['Cinema Camera', 'Premiere Pro', 'DaVinci Resolve', 'After Effects'],
      features: [
        'Professional cinematography',
        'Color grading expertise',
        'Storytelling through visuals',
        'Multi-camera production'
      ],
      liveUrl: 'https://vimeo.com',
      githubUrl: null,
      stats: {
        views: '100K+',
        awards: '3',
        runtime: '45min'
      }
    },
    {
      id: 4,
      title: 'Design System',
      category: 'Design',
      description: 'Comprehensive design system with reusable components, consistent branding, and accessibility-first approach.',
      image: '/assets/images/no_image.png',
      technologies: ['Figma', 'Storybook', 'React', 'TypeScript'],
      features: [
        'Reusable components',
        'Accessibility compliant',
        'Consistent branding',
        'Design tokens'
      ],
      liveUrl: 'https://storybook.com',
      githubUrl: 'https://github.com',
      stats: {
        components: '50+',
        accessibility: 'WCAG 2.1',
        adoption: '90%'
      }
    }
  ];

  const handleProjectChange = (index) => {
    setCurrentProject(index);
    setIsAutoPlay(false);
  };

  const handlePlayPause = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const handleViewProject = (project) => {
    if (project.liveUrl) {
      window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewCode = (project) => {
    if (project.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const currentProjectData = featuredProjects[currentProject];

  return (
    <section id="featured-projects" ref={sectionRef} className="py-20 lg:py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isVisible ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Featured Projects
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Showcasing some of my best work across different disciplines
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Project Image */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isVisible ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated hover:shadow-floating transition-shadow duration-300">
              <img
                src={currentProjectData?.image || '/assets/images/no_image.png'}
                alt={currentProjectData?.title || 'Project'}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Project Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary/90 text-white text-xs font-medium rounded-full">
                  {currentProjectData?.category}
                </span>
              </div>

              {/* Stats Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    {currentProjectData?.stats && Object.entries(currentProjectData.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-white font-semibold text-sm">{value}</div>
                        <div className="text-white/70 text-xs capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Project Details */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={isVisible ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary">
                {currentProjectData?.title}
              </h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                {currentProjectData?.description}
              </p>
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <h4 className="text-text-primary font-semibold">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {currentProjectData?.technologies?.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-surface border border-border rounded-full text-sm text-text-primary hover:border-primary/50 transition-colors duration-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="text-text-primary font-semibold">Key Features</h4>
              <div className="space-y-2">
                {currentProjectData?.features?.map((feature, index) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-primary flex-shrink-0" />
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={() => handleViewProject(currentProjectData)}
                variant="primary"
                size="lg"
                iconName="ExternalLink"
                className="flex-1 sm:flex-initial"
              >
                View Project
              </Button>
              
              {currentProjectData?.githubUrl && (
                <Button
                  onClick={() => handleViewCode(currentProjectData)}
                  variant="outline"
                  size="lg"
                  iconName="Github"
                  className="flex-1 sm:flex-initial"
                >
                  View Code
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Project Navigation */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isVisible ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center justify-center space-x-6 mt-12"
        >
          <div className="flex items-center space-x-2">
            {featuredProjects.map((_, index) => (
              <button
                key={index}
                onClick={() => handleProjectChange(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentProject 
                    ? 'bg-primary scale-125' :'bg-border hover:bg-text-secondary'
                }`}
                aria-label={`Go to project ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-lg bg-surface border border-border hover:border-primary/50 text-text-secondary hover:text-primary transition-colors duration-200"
            aria-label={isAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
          >
            <Icon name={isAutoPlay ? 'Pause' : 'Play'} size={16} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProjects;