import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TimelineEntry = ({ 
  experience, 
  index, 
  isExpanded, 
  onToggleExpand,
  layout = 'vertical'
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const isLeft = layout === 'horizontal' && index % 2 === 0;
  const isRight = layout === 'horizontal' && index % 2 === 1;

  return (
    <div className={`relative ${layout === 'horizontal' ? 'flex items-center min-h-[400px]' : ''}`}>
      {/* Timeline Connector */}
      <div className={`absolute ${
        layout === 'vertical' ?'left-6 top-0 w-0.5 h-full bg-border' :'top-1/2 left-0 w-full h-0.5 bg-border transform -translate-y-1/2'
      }`} />
      
      {/* Timeline Node */}
      <div className={`absolute ${
        layout === 'vertical' ?'left-4 top-8 w-4 h-4' :'left-1/2 top-1/2 w-4 h-4 transform -translate-x-1/2 -translate-y-1/2'
      } bg-primary rounded-full border-4 border-background z-10`} />

      {/* Content Container */}
      <div className={`${
        layout === 'vertical' ?'ml-16 pb-12' 
          : `w-5/12 ${isLeft ? 'pr-12' : 'pl-12 ml-auto'}`
      }`}>
        {/* Date Badge */}
        <div className={`inline-flex items-center px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4 ${
          layout === 'horizontal' && isRight ? 'ml-auto' : ''
        }`}>
          <Icon name="Calendar" size={14} className="text-primary mr-2" />
          <span className="text-primary text-sm font-medium">{experience.duration}</span>
        </div>

        {/* Main Content Card */}
        <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 nav-transition hover-glow">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-background flex-shrink-0">
              {!imageError ? (
                <Image
                  src={experience.companyLogo}
                  alt={`${experience.company} logo`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Icon name="Building" size={20} className="text-primary" />
                </div>
              )}
            </div>

            {/* Role Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-text-primary font-semibold text-lg mb-1">
                {experience.role}
              </h3>
              <div className="flex items-center space-x-2 text-text-secondary text-sm mb-2">
                <span>{experience.company}</span>
                <span>•</span>
                <span>{experience.location}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  experience.type === 'Full-time' ?'bg-success/10 text-success' 
                    : experience.type === 'Contract' ?'bg-warning/10 text-warning' :'bg-accent/10 text-accent'
                }`}>
                  {experience.type}
                </span>
              </div>
              
              {/* Industry Tags */}
              <div className="flex flex-wrap gap-2">
                {experience.industries.map((industry, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-text-secondary text-sm mb-4 leading-relaxed">
            {experience.summary}
          </p>

          {/* Key Achievements (Always Visible) */}
          <div className="mb-4">
            <h4 className="text-text-primary font-medium text-sm mb-2 flex items-center">
              <Icon name="Trophy" size={16} className="text-warning mr-2" />
              Key Achievements
            </h4>
            <ul className="space-y-1">
              {experience.achievements.slice(0, 2).map((achievement, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-text-secondary text-sm">
                  <Icon name="CheckCircle" size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="mb-4">
            <h4 className="text-text-primary font-medium text-sm mb-2 flex items-center">
              <Icon name="Code" size={16} className="text-accent mr-2" />
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {experience.technologies.map((tech, idx) => (
                <div
                  key={idx}
                  className="group relative flex items-center space-x-1 px-2 py-1 bg-background border border-border rounded hover:border-primary/30 nav-transition"
                >
                  <Icon name={tech.icon} size={14} className="text-primary" />
                  <span className="text-text-secondary text-xs">{tech.name}</span>
                  
                  {/* Proficiency Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 nav-transition z-20">
                    <div className="bg-surface border border-border rounded px-2 py-1 shadow-elevated">
                      <div className="flex items-center space-x-2">
                        <span className="text-text-primary text-xs font-medium">{tech.proficiency}</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                i < tech.level ? 'bg-primary' : 'bg-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-surface border-r border-b border-border rotate-45" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(experience.id)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            className="text-primary hover:text-primary/80"
          >
            {isExpanded ? 'Show Less' : 'Show More Details'}
          </Button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
              {/* All Achievements */}
              {experience.achievements.length > 2 && (
                <div className="mb-4">
                  <h4 className="text-text-primary font-medium text-sm mb-2">
                    Additional Achievements
                  </h4>
                  <ul className="space-y-1">
                    {experience.achievements.slice(2).map((achievement, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-text-secondary text-sm">
                        <Icon name="CheckCircle" size={14} className="text-success mt-0.5 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              <div className="mb-4">
                <h4 className="text-text-primary font-medium text-sm mb-2 flex items-center">
                  <Icon name="Target" size={16} className="text-primary mr-2" />
                  Key Responsibilities
                </h4>
                <ul className="space-y-1">
                  {experience.responsibilities.map((responsibility, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-text-secondary text-sm">
                      <Icon name="ArrowRight" size={14} className="text-text-secondary mt-0.5 flex-shrink-0" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Projects */}
              {experience.projects && experience.projects.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-text-primary font-medium text-sm mb-2 flex items-center">
                    <Icon name="FolderOpen" size={16} className="text-accent mr-2" />
                    Notable Projects
                  </h4>
                  <div className="space-y-2">
                    {experience.projects.map((project, idx) => (
                      <div key={idx} className="p-3 bg-background border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-text-primary font-medium text-sm">{project.name}</h5>
                          {project.link && (
                            <Button
                              variant="ghost"
                              size="xs"
                              iconName="ExternalLink"
                              onClick={() => window.open(project.link, '_blank')}
                              className="text-primary hover:text-primary/80"
                            >
                              View
                            </Button>
                          )}
                        </div>
                        <p className="text-text-secondary text-xs mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, techIdx) => (
                            <span
                              key={techIdx}
                              className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonial */}
              {experience.testimonial && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Icon name="Quote" size={16} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-text-secondary text-sm italic mb-2">
                        "{experience.testimonial.quote}"
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-background">
                          <Image
                            src={experience.testimonial.avatar}
                            alt={experience.testimonial.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-text-primary text-xs font-medium">
                            {experience.testimonial.author}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {experience.testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineEntry;