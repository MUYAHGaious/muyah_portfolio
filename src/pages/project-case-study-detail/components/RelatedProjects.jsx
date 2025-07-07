import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RelatedProjects = ({ currentProjectId }) => {
  const navigate = useNavigate();

  const relatedProjects = [
    {
      id: 2,
      title: "Mobile Banking App",
      category: "Mobile Development",
      description: "Secure mobile banking application with biometric authentication and real-time transaction monitoring.",
      thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
      technologies: ["React Native", "Node.js", "MongoDB", "JWT"],
      duration: "4 months"
    },
    {
      id: 3,
      title: "Brand Identity System",
      category: "Design",
      description: "Complete brand identity design including logo, color palette, typography, and brand guidelines.",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
      technologies: ["Adobe Creative Suite", "Figma", "Sketch"],
      duration: "2 months"
    },
    {
      id: 4,
      title: "Data Visualization Dashboard",
      category: "Data Science",
      description: "Interactive dashboard for business intelligence with real-time data visualization and analytics.",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      technologies: ["Python", "D3.js", "React", "PostgreSQL"],
      duration: "3 months"
    },
    {
      id: 5,
      title: "AI Chatbot Integration",
      category: "Machine Learning",
      description: "Intelligent chatbot system with natural language processing and machine learning capabilities.",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      technologies: ["Python", "TensorFlow", "NLP", "FastAPI"],
      duration: "5 months"
    }
  ];

  // Filter out current project and limit to 3 related projects
  const filteredProjects = relatedProjects
    .filter(project => project.id !== currentProjectId)
    .slice(0, 3);

  const handleProjectClick = (projectId) => {
    navigate(`/project-case-study-detail?id=${projectId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllProjects = () => {
    navigate('/project-portfolio-gallery');
  };

  if (filteredProjects.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-text-primary">Related Projects</h2>
        <Button
          variant="outline"
          onClick={handleViewAllProjects}
          iconName="ArrowRight"
          iconPosition="right"
          size="sm"
        >
          View All Projects
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group bg-surface rounded-xl border border-border hover:border-primary/30 nav-transition hover-glow cursor-pointer"
            onClick={() => handleProjectClick(project.id)}
          >
            {/* Project Thumbnail */}
            <div className="relative aspect-video overflow-hidden rounded-t-xl">
              <Image
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30">
                  {project.category}
                </span>
              </div>

              {/* View Project Icon */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="ArrowUpRight" size={16} className="text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="p-6">
              <h3 className="text-text-primary font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-200">
                {project.title}
              </h3>
              
              <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-background text-text-secondary text-xs rounded border border-border"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-1 bg-background text-text-secondary text-xs rounded border border-border">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>

              {/* Project Meta */}
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} />
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>View Case Study</span>
                  <Icon name="ArrowRight" size={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-surface rounded-xl p-8 border border-border">
          <h3 className="text-text-primary font-semibold text-lg mb-2">
            Interested in working together?
          </h3>
          <p className="text-text-secondary mb-6">
            Let's discuss your project and see how I can help bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate('/contact-collaboration-hub')}
              iconName="Mail"
              iconPosition="left"
            >
              Get In Touch
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/professional-experience-timeline')}
              iconName="User"
              iconPosition="left"
            >
              View Experience
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RelatedProjects;