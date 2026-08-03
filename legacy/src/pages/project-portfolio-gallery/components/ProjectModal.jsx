import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ProjectModal = ({ project, isOpen, onClose, onNext, onPrevious }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Reset state when modal opens with new project
  useEffect(() => {
    if (isOpen && project) {
      setCurrentImageIndex(0);
      setIsImageLoaded(false);
    }
  }, [isOpen, project]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleViewDemo = () => {
    if (project?.liveUrl) {
      window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewCode = () => {
    if (project?.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const projectImages = project?.images || [project?.image].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % projectImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + projectImages.length) % projectImages.length);
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-surface rounded-xl shadow-deep max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {project.category}
                </span>
                <h2 className="text-xl font-bold text-text-primary">
                  {project.title}
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Navigation Buttons */}
                {onPrevious && (
                  <button
                    onClick={onPrevious}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-colors duration-200"
                    aria-label="Previous project"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </button>
                )}
                
                {onNext && (
                  <button
                    onClick={onNext}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-colors duration-200"
                    aria-label="Next project"
                  >
                    <Icon name="ChevronRight" size={20} />
                  </button>
                )}
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-hover transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Image Gallery */}
              {projectImages.length > 0 && (
                <div className="relative">
                  <div className="aspect-video bg-border">
                    <img
                      src={projectImages[currentImageIndex] || '/assets/images/no_image.png'}
                      alt={`${project.title} - Image ${currentImageIndex + 1}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        isImageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setIsImageLoaded(true)}
                      onError={() => setIsImageLoaded(true)}
                    />
                    
                    {!isImageLoaded && (
                      <div className="absolute inset-0 bg-border animate-pulse" />
                    )}
                  </div>
                  
                  {/* Image Navigation */}
                  {projectImages.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors duration-200"
                        aria-label="Previous image"
                      >
                        <Icon name="ChevronLeft" size={20} />
                      </button>
                      
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors duration-200"
                        aria-label="Next image"
                      >
                        <Icon name="ChevronRight" size={20} />
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {projectImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex 
                                ? 'bg-white scale-125' :'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Project Details */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-text-primary">About this Project</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {project.description}
                  </p>
                  
                  {project.detailedDescription && (
                    <p className="text-text-secondary leading-relaxed">
                      {project.detailedDescription}
                    </p>
                  )}
                </div>

                {/* Technologies */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-text-primary">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                {project.features && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">Key Features</h3>
                    <div className="space-y-2">
                      {project.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Icon name="CheckCircle" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-text-secondary text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Stats */}
                {project.stats && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">Project Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.entries(project.stats).map(([key, value]) => (
                        <div key={key} className="text-center p-3 bg-surface-hover rounded-lg">
                          <div className="text-lg font-semibold text-text-primary">{value}</div>
                          <div className="text-sm text-text-secondary capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {project.liveUrl && (
                    <Button
                      onClick={handleViewDemo}
                      variant="primary"
                      size="lg"
                      iconName="ExternalLink"
                      className="flex-1"
                    >
                      View Live Demo
                    </Button>
                  )}
                  
                  {project.githubUrl && (
                    <Button
                      onClick={handleViewCode}
                      variant="outline"
                      size="lg"
                      iconName="Github"
                      className="flex-1"
                    >
                      View Source Code
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;