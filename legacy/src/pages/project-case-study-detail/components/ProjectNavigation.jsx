import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const ProjectNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: 'FileText' },
    { id: 'problem', label: 'Problem', icon: 'AlertTriangle' },
    { id: 'solution', label: 'Solution', icon: 'CheckCircle' },
    { id: 'gallery', label: 'Gallery', icon: 'Image' },
    { id: 'technical', label: 'Technical', icon: 'Code' },
    { id: 'results', label: 'Results', icon: 'TrendingUp' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => 
        document.getElementById(section.id)
      ).filter(Boolean);

      const currentSection = sectionElements.find(element => {
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const handleBackToGallery = () => {
    navigate('/project-portfolio-gallery');
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <div className="hidden xl:block fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
        <div className="bg-surface/95 backdrop-blur-nav rounded-xl border border-border shadow-elevated p-4 w-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text-primary font-semibold text-sm">Navigation</h3>
            <button
              onClick={handleBackToGallery}
              className="text-text-secondary hover:text-primary nav-transition p-1 rounded hover:bg-background"
              aria-label="Back to gallery"
            >
              <Icon name="ArrowLeft" size={16} />
            </button>
          </div>

          {/* Section Links */}
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left nav-transition ${
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary border border-primary/20' :'text-text-secondary hover:text-text-primary hover:bg-background'
                }`}
              >
                <Icon 
                  name={section.icon} 
                  size={16} 
                  className={activeSection === section.id ? 'text-primary' : 'text-text-secondary'} 
                />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </nav>

          {/* Progress Indicator */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
              <span>Reading Progress</span>
              <span>{Math.round((sections.findIndex(s => s.id === activeSection) + 1) / sections.length * 100)}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(sections.findIndex(s => s.id === activeSection) + 1) / sections.length * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Navigation */}
      <div className="xl:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-surface/95 backdrop-blur-nav rounded-full border border-border shadow-elevated px-4 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBackToGallery}
              className="w-10 h-10 rounded-full bg-background hover:bg-primary/10 text-text-secondary hover:text-primary nav-transition flex items-center justify-center"
              aria-label="Back to gallery"
            >
              <Icon name="ArrowLeft" size={16} />
            </button>
            
            <div className="flex items-center space-x-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-2 h-2 rounded-full nav-transition ${
                    activeSection === section.id
                      ? 'bg-primary' :'bg-text-secondary hover:bg-text-primary'
                  }`}
                  aria-label={`Go to ${section.label} section`}
                />
              ))}
            </div>

            <div className="text-text-secondary text-xs ml-2">
              {sections.findIndex(s => s.id === activeSection) + 1}/{sections.length}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectNavigation;