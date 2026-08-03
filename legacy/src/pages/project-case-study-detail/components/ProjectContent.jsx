import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ProjectContent = ({ project }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const navigateImage = (direction) => {
    if (!project?.gallery?.length) return;
    
    const newIndex = direction === 'next' 
      ? (activeImageIndex + 1) % project.gallery.length
      : (activeImageIndex - 1 + project.gallery.length) % project.gallery.length;
    setActiveImageIndex(newIndex);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigateImage('next');
    if (e.key === 'ArrowLeft') navigateImage('prev');
  };

  React.useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, activeImageIndex]);

  // Early return if project is not available
  if (!project) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <Icon name="AlertCircle" size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">Project data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Project Overview */}
      <section>
        <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">Project Overview</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-text-secondary leading-relaxed mb-4">
            {project?.overview || 'No overview available'}
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section>
        <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">Problem Statement</h2>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="text-text-primary font-semibold mb-2">Challenge</h3>
              <p className="text-text-secondary leading-relaxed">
                {project?.problem || 'No problem statement available'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Approach */}
      <section>
        <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">Solution Approach</h2>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <h3 className="text-text-primary font-semibold mb-2">Solution</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                {project?.solution || 'No solution description available'}
              </p>
              
              {project?.features && project.features.length > 0 && (
                <div>
                  <h4 className="text-text-primary font-medium mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Icon name="ArrowRight" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      {project?.gallery && project.gallery.length > 0 && (
        <section>
          <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">Project Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.gallery.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video bg-surface rounded-lg overflow-hidden cursor-pointer group hover-glow"
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={image?.url}
                  alt={image?.caption || `Project screenshot ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300 flex items-center justify-center">
                  <Icon 
                    name="ZoomIn" 
                    size={24} 
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  />
                </div>
                {image?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-3">
                    <p className="text-text-primary text-sm font-medium">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Implementation */}
      <section>
        <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">Technical Implementation</h2>
        <div className="space-y-6">
          {project?.technicalDetails && project.technicalDetails.length > 0 ? (
            project.technicalDetails.map((detail, index) => (
              <div key={index} className="bg-surface rounded-xl p-6 border border-border">
                <h3 className="text-text-primary font-semibold mb-3 flex items-center space-x-2">
                  <Icon name="Code" size={18} className="text-primary" />
                  <span>{detail?.title || 'Technical Detail'}</span>
                </h3>
                <p className="text-text-secondary leading-relaxed mb-4">
                  {detail?.description || 'No description available'}
                </p>
                
                {detail?.codeSnippet && (
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <pre className="text-sm text-text-secondary overflow-x-auto">
                      <code>{detail.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-surface rounded-xl p-6 border border-border">
              <p className="text-text-secondary text-center">No technical details available</p>
            </div>
          )}
        </div>
      </section>

      {/* Results & Impact */}
      <section>
        <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">Results & Impact</h2>
        <div className="bg-surface rounded-xl p-6 border border-border">
          {project?.results && project.results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.results.map((result, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon name={result?.icon || 'TrendingUp'} size={24} className="text-primary" />
                  </div>
                  <h3 className="text-text-primary font-semibold text-lg mb-1">{result?.value || 'N/A'}</h3>
                  <p className="text-text-secondary text-sm">{result?.label || 'Metric'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="BarChart" size={48} className="text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">No results data available</p>
            </div>
          )}
          
          {project?.impact && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-text-secondary leading-relaxed">
                {project.impact}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {isLightboxOpen && project?.gallery && project.gallery.length > 0 && (
        <div className="fixed inset-0 z-100 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 w-10 h-10 bg-surface hover:bg-surface/80 rounded-full flex items-center justify-center nav-transition z-10"
              aria-label="Close lightbox"
            >
              <Icon name="X" size={20} className="text-text-primary" />
            </button>

            {/* Navigation Buttons */}
            {project.gallery.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-surface/80 hover:bg-surface rounded-full flex items-center justify-center nav-transition z-10"
                  aria-label="Previous image"
                >
                  <Icon name="ChevronLeft" size={24} className="text-text-primary" />
                </button>

                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-surface/80 hover:bg-surface rounded-full flex items-center justify-center nav-transition z-10"
                  aria-label="Next image"
                >
                  <Icon name="ChevronRight" size={24} className="text-text-primary" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative">
              <Image
                src={project.gallery[activeImageIndex]?.url}
                alt={project.gallery[activeImageIndex]?.caption || `Project image ${activeImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Image Counter */}
              {project.gallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full">
                  <span className="text-text-primary text-sm">
                    {activeImageIndex + 1} / {project.gallery.length}
                  </span>
                </div>
              )}
            </div>

            {/* Caption */}
            {project.gallery[activeImageIndex]?.caption && (
              <div className="mt-4 text-center">
                <p className="text-text-secondary">
                  {project.gallery[activeImageIndex].caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectContent;