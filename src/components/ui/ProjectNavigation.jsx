import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';

const ProjectNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Mock project data - in real app this would come from props or context
  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      category: 'Web Development',
      thumbnail: '/assets/images/project-1.jpg',
      path: '/project-case-study-detail?id=1'
    },
    {
      id: 2,
      title: 'Mobile Banking App',
      category: 'Mobile Development',
      thumbnail: '/assets/images/project-2.jpg',
      path: '/project-case-study-detail?id=2'
    },
    {
      id: 3,
      title: 'Brand Identity System',
      category: 'Design',
      thumbnail: '/assets/images/project-3.jpg',
      path: '/project-case-study-detail?id=3'
    },
    {
      id: 4,
      title: 'Data Visualization Dashboard',
      category: 'Data Science',
      thumbnail: '/assets/images/project-4.jpg',
      path: '/project-case-study-detail?id=4'
    },
    {
      id: 5,
      title: 'AI Chatbot Integration',
      category: 'Machine Learning',
      thumbnail: '/assets/images/project-5.jpg',
      path: '/project-case-study-detail?id=5'
    }
  ];

  useEffect(() => {
    // Show project navigation only on case study detail page
    setIsVisible(location.pathname === '/project-case-study-detail');
    
    // Get current project from URL params
    const urlParams = new URLSearchParams(location.search);
    const projectId = urlParams.get('id');
    if (projectId) {
      const index = projects.findIndex(p => p.id === parseInt(projectId));
      if (index !== -1) {
        setCurrentProjectIndex(index);
      }
    }
  }, [location]);

  const navigateToProject = (index) => {
    if (index >= 0 && index < projects.length) {
      const project = projects[index];
      navigate(project.path);
      setCurrentProjectIndex(index);
    }
  };

  const goToPrevious = () => {
    const prevIndex = currentProjectIndex > 0 ? currentProjectIndex - 1 : projects.length - 1;
    navigateToProject(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = currentProjectIndex < projects.length - 1 ? currentProjectIndex + 1 : 0;
    navigateToProject(nextIndex);
  };

  const goToGallery = () => {
    navigate('/project-portfolio-gallery');
  };

  if (!isVisible) {
    return null;
  }

  const currentProject = projects[currentProjectIndex];
  const previousProject = projects[currentProjectIndex > 0 ? currentProjectIndex - 1 : projects.length - 1];
  const nextProject = projects[currentProjectIndex < projects.length - 1 ? currentProjectIndex + 1 : 0];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 z-60">
        <div className="bg-surface/95 backdrop-blur-nav rounded-xl border border-border shadow-elevated p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold text-sm">Project Navigation</h3>
            <button
              onClick={goToGallery}
              className="text-text-secondary hover:text-primary nav-transition p-1 rounded hover:bg-surface"
              aria-label="View all projects"
            >
              <Icon name="Grid3X3" size={16} />
            </button>
          </div>

          {/* Current Project */}
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface">
                <Image
                  src={currentProject.thumbnail}
                  alt={currentProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium text-sm truncate">
                  {currentProject.title}
                </p>
                <p className="text-text-secondary text-xs">
                  {currentProject.category}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevious}
              className="flex items-center space-x-2 text-text-secondary hover:text-primary nav-transition p-2 rounded-lg hover:bg-surface hover-glow"
              aria-label="Previous project"
            >
              <Icon name="ChevronLeft" size={16} />
              <span className="text-xs">Previous</span>
            </button>

            <div className="text-text-secondary text-xs">
              {currentProjectIndex + 1} of {projects.length}
            </div>

            <button
              onClick={goToNext}
              className="flex items-center space-x-2 text-text-secondary hover:text-primary nav-transition p-2 rounded-lg hover:bg-surface hover-glow"
              aria-label="Next project"
            >
              <span className="text-xs">Next</span>
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>

          {/* Project Thumbnails */}
          <div className="space-y-2">
            <p className="text-text-secondary text-xs font-medium">Other Projects</p>
            <div className="grid grid-cols-2 gap-2">
              {projects.filter((_, index) => index !== currentProjectIndex).slice(0, 4).map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => navigateToProject(projects.findIndex(p => p.id === project.id))}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-surface hover:ring-2 hover:ring-primary/50 nav-transition"
                >
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 nav-transition">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-text-primary text-xs font-medium truncate">
                        {project.title}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-60 bg-surface/95 backdrop-blur-nav border-t border-border">
        <div className="px-4 py-3">
          {/* Current Project Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-background">
                <Image
                  src={currentProject.thumbnail}
                  alt={currentProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium text-sm truncate">
                  {currentProject.title}
                </p>
                <p className="text-text-secondary text-xs">
                  {currentProjectIndex + 1} of {projects.length}
                </p>
              </div>
            </div>
            <button
              onClick={goToGallery}
              className="text-text-secondary hover:text-primary nav-transition p-2 rounded-lg hover:bg-surface"
              aria-label="View all projects"
            >
              <Icon name="Grid3X3" size={20} />
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevious}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary rounded-lg nav-transition border border-border hover:border-primary/30"
            >
              <Icon name="ChevronLeft" size={18} />
              <span className="text-sm font-medium">Previous</span>
            </button>

            <button
              onClick={goToNext}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg nav-transition hover-glow"
            >
              <span className="text-sm font-medium">Next</span>
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-24" />
    </>
  );
};

export default ProjectNavigation;