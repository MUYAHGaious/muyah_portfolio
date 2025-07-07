import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from 'components/ui/Header';
import FilterChips from './components/FilterChips';
import SearchBar from './components/SearchBar';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';

const ProjectPortfolioGallery = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleProjects, setVisibleProjects] = useState(6);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

  // Mock project data
  const allProjects = [
    {
      id: 1,
      title: 'E-Commerce Analytics Dashboard',
      category: 'data',
      description: 'Interactive dashboard for visualizing e-commerce sales data with real-time analytics and machine learning-powered insights for business decision making.',
      detailedDescription: 'A comprehensive analytics platform that processes over 1 million transactions daily, providing real-time insights into customer behavior, sales trends, and inventory management. Built with modern data visualization techniques and predictive analytics.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['Python', 'TensorFlow', 'React', 'D3.js', 'PostgreSQL', 'Redis'],
      features: [
        'Real-time data processing with Apache Kafka',
        'Machine learning predictions for sales forecasting',
        'Interactive data visualization with D3.js',
        'Automated report generation and email alerts',
        'Multi-tenant architecture for scalability'
      ],
      stats: {
        'Data Points': '10M+',
        'Accuracy': '94%',
        'Response Time': '<100ms'
      },
      liveUrl: 'https://analytics-demo.example.com',
      githubUrl: 'https://github.com/example/analytics-dashboard'
    },
    {
      id: 2,
      title: 'Modern Web Application',
      category: 'web',
      description: 'Full-stack web application built with React, Node.js, and MongoDB featuring real-time collaboration, authentication, and responsive design.',
      detailedDescription: 'A modern SaaS platform that enables teams to collaborate in real-time with features like document editing, video conferencing, and project management. Built with scalability and performance in mind.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Redis', 'AWS'],
      features: [
        'Real-time collaboration with WebSocket',
        'JWT-based authentication and authorization',
        'Responsive design with Tailwind CSS',
        'File upload and management with AWS S3',
        'Docker containerization for easy deployment'
      ],
      stats: {
        'Active Users': '5K+',
        'Uptime': '99.9%',
        'Performance': '95/100'
      },
      liveUrl: 'https://webapp-demo.example.com',
      githubUrl: 'https://github.com/example/web-app'
    },
    {
      id: 3,
      title: 'Brand Identity Design System',
      category: 'design',
      description: 'Comprehensive design system with reusable components, consistent branding guidelines, and accessibility-first approach for modern applications.',
      detailedDescription: 'A complete design system that includes color palettes, typography, iconography, and component libraries. Designed to ensure consistency across all digital touchpoints while maintaining accessibility standards.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['Figma', 'Storybook', 'React', 'TypeScript', 'Tailwind CSS'],
      features: [
        'Component library with 50+ reusable components',
        'WCAG 2.1 AA accessibility compliance',
        'Design tokens for consistent styling',
        'Interactive documentation with Storybook',
        'Automated testing for visual regression'
      ],
      stats: {
        'Components': '50+',
        'Accessibility': 'WCAG 2.1',
        'Adoption': '90%'
      },
      liveUrl: 'https://design-system.example.com',
      githubUrl: 'https://github.com/example/design-system'
    },
    {
      id: 4,
      title: 'Corporate Documentary',
      category: 'film',
      description: 'Award-winning documentary showcasing innovative startups and their impact on the tech industry, featuring professional cinematography and storytelling.',
      detailedDescription: 'A 45-minute documentary that follows the journey of three tech startups from ideation to market success. Shot with professional cinema cameras and features interviews with industry leaders.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['Cinema Camera', 'Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Pro Tools'],
      features: [
        'Professional 4K cinematography',
        'Expert color grading and sound design',
        'Multi-camera interview setups',
        'Drone footage for establishing shots',
        'Original soundtrack composition'
      ],
      stats: {
        'Views': '100K+',
        'Awards': '3',
        'Runtime': '45min'
      },
      liveUrl: 'https://vimeo.com/example-documentary',
      githubUrl: null
    },
    {
      id: 5,
      title: 'Machine Learning Pipeline',
      category: 'data',
      description: 'Scalable ML pipeline for processing and analyzing large datasets with automated model training, evaluation, and deployment capabilities.',
      detailedDescription: 'An end-to-end machine learning pipeline that handles data ingestion, preprocessing, model training, and deployment. Built with MLOps best practices for production-ready ML systems.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['Python', 'scikit-learn', 'Docker', 'Kubernetes', 'MLflow', 'Apache Airflow'],
      features: [
        'Automated data preprocessing and feature engineering',
        'Model versioning and experiment tracking',
        'Continuous integration and deployment',
        'A/B testing framework for model evaluation',
        'Monitoring and alerting for model performance'
      ],
      stats: {
        'Models': '25+',
        'Accuracy': '96%',
        'Deployment Time': '<5min'
      },
      liveUrl: 'https://ml-pipeline.example.com',
      githubUrl: 'https://github.com/example/ml-pipeline'
    },
    {
      id: 6,
      title: 'Progressive Web App',
      category: 'web',
      description: 'High-performance PWA with offline capabilities, push notifications, and native app-like experience across all devices.',
      detailedDescription: 'A Progressive Web Application that provides a native app experience on the web with offline functionality, push notifications, and installation capabilities.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['React', 'Service Workers', 'WebAssembly', 'IndexedDB', 'Web Push API'],
      features: [
        'Offline-first architecture with service workers',
        'Push notification system',
        'App shell architecture for fast loading',
        'Background sync for data consistency',
        'Responsive design optimized for all devices'
      ],
      stats: {
        'Load Time': '<2s',
        'Offline Support': '100%',
        'Lighthouse Score': '95'
      },
      liveUrl: 'https://pwa-demo.example.com',
      githubUrl: 'https://github.com/example/pwa'
    },
    {
      id: 7,
      title: 'Motion Graphics Package',
      category: 'design',
      description: 'Animated motion graphics package for brand presentations, featuring smooth transitions and engaging visual storytelling elements.',
      detailedDescription: 'A comprehensive motion graphics package that includes animated logos, transitions, and visual elements for brand presentations and marketing materials.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['After Effects', 'Cinema 4D', 'Illustrator', 'Photoshop'],
      features: [
        'Animated logo variations and transitions',
        'Template library for consistent branding',
        'Smooth motion design with easing curves',
        'Scalable vector graphics for any resolution',
        'Sound design and audio synchronization'
      ],
      stats: {
        'Animations': '30+',
        'Templates': '15',
        'Formats': '10+'
      },
      liveUrl: 'https://motion-graphics.example.com',
      githubUrl: null
    },
    {
      id: 8,
      title: 'Travel Documentary Series',
      category: 'film',
      description: 'Episodic travel documentary series exploring hidden gems around the world, featuring immersive storytelling and breathtaking cinematography.',
      detailedDescription: 'A 6-episode travel documentary series that explores lesser-known destinations and cultures, shot in 4K with professional equipment and featuring local stories.',
      image: '/assets/images/no_image.png',
      images: ['/assets/images/no_image.png'],
      technologies: ['RED Cinema Camera', 'DJI Drone', 'Premiere Pro', 'DaVinci Resolve'],
      features: [
        'Cinematic 4K footage with RED cameras',
        'Aerial cinematography with professional drones',
        'Cultural storytelling and local interviews',
        'Expert post-production and color grading',
        'Multi-language subtitles and accessibility'
      ],
      stats: {
        'Episodes': '6',
        'Countries': '12',
        'Total Runtime': '4.5hrs'
      },
      liveUrl: 'https://travel-docs.example.com',
      githubUrl: null
    }
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = allProjects;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(project => project.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.technologies?.some(tech => tech.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [activeCategory, searchTerm]);

  // Calculate project counts for filter chips
  const projectCounts = useMemo(() => {
    const counts = { all: allProjects.length };
    
    allProjects.forEach(project => {
      counts[project.category] = (counts[project.category] || 0) + 1;
    });

    return counts;
  }, []);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (visibleProjects < filteredProjects.length && !isInfiniteLoading) {
          setIsInfiniteLoading(true);
          setTimeout(() => {
            setVisibleProjects(prev => Math.min(prev + 6, filteredProjects.length));
            setIsInfiniteLoading(false);
          }, 500);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleProjects, filteredProjects.length, isInfiniteLoading]);

  // Reset visible projects when filters change
  useEffect(() => {
    setVisibleProjects(6);
  }, [activeCategory, searchTerm]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleViewDemo = (project) => {
    if (project?.liveUrl) {
      window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewCode = (project) => {
    if (project?.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNextProject = () => {
    const currentIndex = filteredProjects.findIndex(p => p.id === selectedProject?.id);
    const nextIndex = (currentIndex + 1) % filteredProjects.length;
    setSelectedProject(filteredProjects[nextIndex]);
  };

  const handlePreviousProject = () => {
    const currentIndex = filteredProjects.findIndex(p => p.id === selectedProject?.id);
    const prevIndex = (currentIndex - 1 + filteredProjects.length) % filteredProjects.length;
    setSelectedProject(filteredProjects[prevIndex]);
  };

  const visibleProjectsList = filteredProjects.slice(0, visibleProjects);

  return (
    <>
      <Helmet>
        <title>Project Portfolio Gallery - Muyah | Explore My Work</title>
        <meta 
          name="description" 
          content="Explore Muyah's diverse project portfolio featuring data science, web development, design, and film projects. Filter by category and discover innovative solutions." 
        />
        <meta 
          name="keywords" 
          content="portfolio, projects, data science, web development, design, film, React, Python, machine learning, cinematography" 
        />
        <meta property="og:title" content="Project Portfolio Gallery - Muyah" />
        <meta property="og:description" content="Explore innovative projects across data science, web development, design, and film." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://muyah.dev/project-portfolio-gallery" />
        <link rel="canonical" href="https://muyah.dev/project-portfolio-gallery" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
                Project Portfolio
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
                Explore my diverse collection of projects across data science, web development, design, and film. 
                Each project showcases different skills and innovative solutions.
              </p>
            </motion.div>

            {/* Search and Filter Section */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Search Bar */}
                <div className="lg:flex-1 lg:max-w-md">
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    placeholder="Search projects, technologies..."
                  />
                </div>

                {/* Filter Chips */}
                <div className="lg:flex-1 lg:max-w-2xl">
                  <FilterChips
                    categories={['all', 'data', 'web', 'design', 'film']}
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                    projectCounts={projectCounts}
                  />
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {filteredProjects.length === 0 && !isLoading ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-text-primary mb-2">
                    No projects found
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActiveCategory('all');
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Project Cards */}
                  {isLoading ? (
                    // Loading skeleton cards
                    Array.from({ length: 6 }).map((_, index) => (
                      <ProjectCard
                        key={`loading-${index}`}
                        isLoading={true}
                      />
                    ))
                  ) : (
                    visibleProjectsList.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onViewDetails={handleProjectClick}
                        onViewDemo={handleViewDemo}
                        onViewCode={handleViewCode}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Infinite Loading Indicator */}
              {isInfiniteLoading && (
                <div className="flex justify-center mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <ProjectCard
                        key={`infinite-loading-${index}`}
                        isLoading={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Load More Indicator */}
              {!isLoading && visibleProjects < filteredProjects.length && !isInfiniteLoading && (
                <div className="text-center mt-8">
                  <p className="text-text-secondary">
                    Showing {visibleProjects} of {filteredProjects.length} projects
                  </p>
                  <p className="text-sm text-text-secondary mt-2">
                    Scroll down to load more projects
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </main>

        {/* Project Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onNext={handleNextProject}
          onPrevious={handlePreviousProject}
        />
      </div>
    </>
  );
};

export default ProjectPortfolioGallery;