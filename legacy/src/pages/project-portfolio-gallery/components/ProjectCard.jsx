import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ProjectCard = ({ 
  project, 
  onViewDetails,
  onViewDemo,
  onViewCode,
  isLoading = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-xl border border-border p-6 animate-pulse"
      >
        <div className="aspect-video bg-border rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-border rounded w-3/4" />
          <div className="h-3 bg-border rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-border rounded w-full" />
            <div className="h-3 bg-border rounded w-4/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-border rounded w-16" />
            <div className="h-6 bg-border rounded w-20" />
          </div>
        </div>
      </motion.div>
    );
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleViewDemo = (e) => {
    e.stopPropagation();
    onViewDemo?.(project);
  };

  const handleViewCode = (e) => {
    e.stopPropagation();
    onViewCode?.(project);
  };

  const handleCardClick = () => {
    onViewDetails?.(project);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-surface rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elevated cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Project Image */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-border animate-pulse" />
          )}
          
          <img
            src={imageError ? '/assets/images/no_image.png' : project?.image}
            alt={project?.title || 'Project'}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-surface/90 backdrop-blur-sm text-text-primary text-xs font-medium rounded-full">
              {project?.category}
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              {project?.liveUrl && (
                <button
                  onClick={handleViewDemo}
                  className="p-2 bg-surface/90 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                  aria-label="View live demo"
                >
                  <Icon name="ExternalLink" size={14} />
                </button>
              )}
              {project?.githubUrl && (
                <button
                  onClick={handleViewCode}
                  className="p-2 bg-surface/90 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                  aria-label="View source code"
                >
                  <Icon name="Github" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Title and Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
                {project?.title}
              </h3>
              <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed">
                {project?.description}
              </p>
            </div>

            {/* Technologies */}
            <div className="flex flex-wrap gap-1.5">
              {project?.technologies?.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {tech}
                </span>
              ))}
              {project?.technologies?.length > 3 && (
                <span className="px-2 py-1 bg-text-secondary/10 text-text-secondary text-xs rounded-full">
                  +{project.technologies.length - 3} more
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCardClick}
                className="flex-1 text-xs"
                iconName="Eye"
              >
                View Details
              </Button>
              
              {project?.liveUrl && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewDemo}
                  className="flex-1 text-xs"
                  iconName="ExternalLink"
                >
                  Live Demo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;