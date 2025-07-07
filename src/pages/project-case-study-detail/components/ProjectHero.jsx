import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectHero = ({ project }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoToggle = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleLiveDemo = () => {
    if (project.liveUrl) {
      window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGithubView = () => {
    if (project.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative w-full">
      {/* Hero Media */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] overflow-hidden rounded-xl bg-surface">
        {project.type === 'video' && project.videoUrl ? (
          <div className="relative w-full h-full">
            {!isVideoPlaying ? (
              <>
                <Image
                  src={project.heroImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                  <button
                    onClick={handleVideoToggle}
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center nav-transition hover-glow"
                    aria-label="Play video"
                  >
                    <Icon name="Play" size={24} className="text-primary-foreground ml-1" />
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full h-full">
                <iframe
                  src={project.videoUrl}
                  title={project.title}
                  className="w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={handleVideoToggle}
                  className="absolute top-4 right-4 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center nav-transition"
                  aria-label="Close video"
                >
                  <Icon name="X" size={16} className="text-text-primary" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <Image
            src={project.heroImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Project badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30">
            {project.category}
          </span>
          {project.featured && (
            <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full border border-accent/30">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="mt-6 lg:mt-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Column - Project Details */}
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-text-primary mb-4">
              {project.title}
            </h1>
            
            <p className="text-text-secondary text-base lg:text-lg leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Technology Stack */}
            <div className="mb-6">
              <h3 className="text-text-primary font-semibold text-sm mb-3">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-surface text-text-secondary text-sm rounded-lg border border-border hover:border-primary/30 nav-transition"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center lg:text-left">
                <p className="text-text-primary font-semibold text-lg">{project.duration}</p>
                <p className="text-text-secondary text-sm">Duration</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-text-primary font-semibold text-lg">{project.role}</p>
                <p className="text-text-secondary text-sm">Role</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-text-primary font-semibold text-lg">{project.team}</p>
                <p className="text-text-secondary text-sm">Team Size</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-text-primary font-semibold text-lg">{project.year}</p>
                <p className="text-text-secondary text-sm">Year</p>
              </div>
            </div>
          </div>

          {/* Right Column - Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
            {project.liveUrl && (
              <Button
                variant="primary"
                onClick={handleLiveDemo}
                iconName="ExternalLink"
                iconPosition="right"
                className="w-full"
              >
                View Live Demo
              </Button>
            )}
            
            {project.githubUrl && (
              <Button
                variant="outline"
                onClick={handleGithubView}
                iconName="Github"
                iconPosition="left"
                className="w-full"
              >
                View Code
              </Button>
            )}

            {project.downloadUrl && (
              <Button
                variant="secondary"
                onClick={() => window.open(project.downloadUrl, '_blank')}
                iconName="Download"
                iconPosition="left"
                className="w-full"
              >
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHero;