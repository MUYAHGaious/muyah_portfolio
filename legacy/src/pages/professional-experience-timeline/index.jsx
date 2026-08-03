import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TimelineEntry from './components/TimelineEntry';
import TimelineFilters from './components/TimelineFilters';
import ExperienceStats from './components/ExperienceStats';
import ResumeDownload from './components/ResumeDownload';
import SkillsOverview from './components/SkillsOverview';

const ProfessionalExperienceTimeline = () => {
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState({
    industry: 'all',
    role: 'all'
  });
  const [layout, setLayout] = useState('vertical');
  const [isLoading, setIsLoading] = useState(true);

  // Mock professional experience data
  const experiences = [
    {
      id: 1,
      role: "Senior Full Stack Developer",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      duration: "Jan 2023 - Present",
      durationYears: 2,
      type: "Full-time",
      industries: ["Technology", "SaaS"],
      companyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
      summary: "Leading development of enterprise-scale web applications using React, Node.js, and cloud technologies. Mentoring junior developers and driving technical architecture decisions.",
      achievements: [
        "Increased application performance by 40% through code optimization and caching strategies",
        "Led migration of legacy systems to modern microservices architecture",
        "Mentored 5 junior developers, improving team productivity by 25%",
        "Implemented CI/CD pipelines reducing deployment time by 60%"
      ],
      responsibilities: [
        "Architect and develop scalable web applications using React and Node.js",
        "Lead code reviews and maintain high code quality standards",
        "Collaborate with product managers and designers on feature development",
        "Optimize application performance and implement monitoring solutions"
      ],
      technologies: [
        { name: "React", icon: "Code", level: 5, proficiency: "Expert", category: "Frontend" },
        { name: "Node.js", icon: "Server", level: 5, proficiency: "Expert", category: "Backend" },
        { name: "TypeScript", icon: "Code2", level: 4, proficiency: "Advanced", category: "Frontend" },
        { name: "PostgreSQL", icon: "Database", level: 4, proficiency: "Advanced", category: "Database" },
        { name: "AWS", icon: "Cloud", level: 4, proficiency: "Advanced", category: "DevOps" },
        { name: "Docker", icon: "Package", level: 3, proficiency: "Intermediate", category: "DevOps" }
      ],
      projects: [
        {
          name: "Enterprise Dashboard Platform",
          description: "Built a comprehensive analytics dashboard serving 10,000+ users",
          technologies: ["React", "D3.js", "Node.js", "PostgreSQL"],
          link: "https://github.com/muyah/enterprise-dashboard"
        },
        {
          name: "Microservices Migration",
          description: "Led migration from monolith to microservices architecture",
          technologies: ["Node.js", "Docker", "Kubernetes", "AWS"],
          link: null
        }
      ],
      testimonial: {
        quote: "Muyah consistently delivers high-quality solutions and has been instrumental in modernizing our tech stack. His leadership and technical expertise are exceptional.",
        author: "Sarah Johnson",
        role: "Engineering Manager at TechCorp",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg"
      }
    },
    {
      id: 2,
      role: "Data Science Consultant",
      company: "DataInsights LLC",
      location: "Remote",
      duration: "Mar 2022 - Dec 2022",
      durationYears: 0.75,
      type: "Contract",
      industries: ["Consulting", "Analytics"],
      companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center",
      summary: "Developed machine learning models and data pipelines for client projects across various industries. Specialized in NLP and computer vision applications.",
      achievements: [
        "Built ML models achieving 95% accuracy for client classification tasks",
        "Reduced data processing time by 70% through pipeline optimization",
        "Delivered 8 successful client projects within budget and timeline"
      ],
      responsibilities: [
        "Design and implement machine learning models for client requirements",
        "Build data pipelines and ETL processes for large-scale data processing",
        "Create data visualizations and reports for stakeholder presentations",
        "Collaborate with clients to understand business requirements and translate to technical solutions"
      ],
      technologies: [
        { name: "Python", icon: "Code", level: 5, proficiency: "Expert", category: "Data Science" },
        { name: "TensorFlow", icon: "Brain", level: 4, proficiency: "Advanced", category: "Data Science" },
        { name: "Pandas", icon: "BarChart3", level: 5, proficiency: "Expert", category: "Data Science" },
        { name: "SQL", icon: "Database", level: 4, proficiency: "Advanced", category: "Database" },
        { name: "Apache Spark", icon: "Zap", level: 3, proficiency: "Intermediate", category: "Data Science" },
        { name: "Tableau", icon: "PieChart", level: 3, proficiency: "Intermediate", category: "Data Science" }
      ],
      projects: [
        {
          name: "Sentiment Analysis Pipeline",
          description: "NLP pipeline for social media sentiment analysis with 95% accuracy",
          technologies: ["Python", "NLTK", "TensorFlow", "Apache Kafka"],
          link: "https://github.com/muyah/sentiment-pipeline"
        }
      ],
      testimonial: {
        quote: "Muyah\'s expertise in machine learning and data science helped us achieve breakthrough results in our analytics projects.",
        author: "Michael Chen",
        role: "CTO at DataInsights",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg"
      }
    },
    {
      id: 3,
      role: "Frontend Developer",
      company: "Creative Studios",
      location: "New York, NY",
      duration: "Jun 2021 - Feb 2022",
      durationYears: 0.67,
      type: "Full-time",
      industries: ["Creative", "Digital Agency"],
      companyLogo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop&crop=center",
      summary: "Developed responsive web applications and interactive experiences for high-profile clients. Collaborated closely with designers to bring creative visions to life.",
      achievements: [
        "Delivered 15+ client projects with 100% on-time completion rate",
        "Improved website performance scores by average 35% across all projects",
        "Won \'Best Interactive Experience\' award for client portfolio site"
      ],
      responsibilities: [
        "Develop responsive web applications using modern JavaScript frameworks",
        "Collaborate with design team to implement pixel-perfect UI/UX",
        "Optimize web performance and ensure cross-browser compatibility",
        "Integrate with various APIs and third-party services"
      ],
      technologies: [
        { name: "React", icon: "Code", level: 4, proficiency: "Advanced", category: "Frontend" },
        { name: "Vue.js", icon: "Code2", level: 3, proficiency: "Intermediate", category: "Frontend" },
        { name: "SASS", icon: "Palette", level: 4, proficiency: "Advanced", category: "Frontend" },
        { name: "JavaScript", icon: "Code", level: 5, proficiency: "Expert", category: "Frontend" },
        { name: "Webpack", icon: "Package", level: 3, proficiency: "Intermediate", category: "DevOps" },
        { name: "Figma", icon: "Figma", level: 3, proficiency: "Intermediate", category: "Design" }
      ],
      projects: [
        {
          name: "Interactive Portfolio Platform",
          description: "Award-winning interactive portfolio site with custom animations",
          technologies: ["React", "Three.js", "GSAP", "Node.js"],
          link: "https://github.com/muyah/interactive-portfolio"
        }
      ],
      testimonial: null
    },
    {
      id: 4,
      role: "Cinematographer & Video Editor",
      company: "Freelance",
      location: "Los Angeles, CA",
      duration: "Jan 2020 - May 2021",
      durationYears: 1.33,
      type: "Freelance",
      industries: ["Creative", "Entertainment"],
      companyLogo: "https://images.unsplash.com/photo-1489599904472-c2d34d17e1a1?w=100&h=100&fit=crop&crop=center",
      summary: "Provided cinematography and post-production services for various clients including music videos, commercials, and documentary projects.",
      achievements: [
        "Completed 25+ video projects with 98% client satisfaction rate",
        "Generated $150K+ in freelance revenue over 16 months",
        "Featured work in 3 film festivals with 2 award nominations"
      ],
      responsibilities: [
        "Plan and execute video shoots including lighting and camera operation",
        "Edit and color grade footage using professional software",
        "Collaborate with clients on creative vision and project requirements",
        "Manage project timelines and deliver final products on schedule"
      ],
      technologies: [
        { name: "Adobe Premiere", icon: "Video", level: 5, proficiency: "Expert", category: "Design" },
        { name: "DaVinci Resolve", icon: "Film", level: 4, proficiency: "Advanced", category: "Design" },
        { name: "After Effects", icon: "Layers", level: 4, proficiency: "Advanced", category: "Design" },
        { name: "Cinema 4D", icon: "Box", level: 3, proficiency: "Intermediate", category: "Design" },
        { name: "Photoshop", icon: "Image", level: 4, proficiency: "Advanced", category: "Design" }
      ],
      projects: [
        {
          name: "Music Video Series",
          description: "Cinematography for 8-part music video series for emerging artists",
          technologies: ["RED Camera", "Adobe Premiere", "DaVinci Resolve"],
          link: null
        }
      ],
      testimonial: {
        quote: "Muyah's creative vision and technical expertise brought our music videos to life. His attention to detail is remarkable.",
        author: "Alex Rivera",
        role: "Music Producer",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg"
      }
    },
    {
      id: 5,
      role: "Junior Web Developer",
      company: "StartupTech Inc",
      location: "Austin, TX",
      duration: "Aug 2019 - Dec 2019",
      durationYears: 0.33,
      type: "Full-time",
      industries: ["Technology", "Startup"],
      companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=center",
      summary: "First professional development role focusing on frontend development and learning modern web technologies in a fast-paced startup environment.",
      achievements: [
        "Successfully completed onboarding and contributed to production code within 2 weeks",
        "Built 5 new feature components that improved user engagement by 20%",
        "Participated in code reviews and learned best practices from senior developers"
      ],
      responsibilities: [
        "Develop user interface components using React and modern CSS",
        "Fix bugs and implement small features under senior developer guidance",
        "Participate in daily standups and sprint planning meetings",
        "Write unit tests and maintain code documentation"
      ],
      technologies: [
        { name: "React", icon: "Code", level: 3, proficiency: "Intermediate", category: "Frontend" },
        { name: "JavaScript", icon: "Code", level: 3, proficiency: "Intermediate", category: "Frontend" },
        { name: "CSS", icon: "Palette", level: 4, proficiency: "Advanced", category: "Frontend" },
        { name: "Git", icon: "GitBranch", level: 3, proficiency: "Intermediate", category: "DevOps" },
        { name: "Jest", icon: "TestTube", level: 2, proficiency: "Beginner", category: "DevOps" }
      ],
      projects: [
        {
          name: "User Dashboard Redesign",
          description: "Redesigned user dashboard with improved UX and performance",
          technologies: ["React", "CSS Modules", "Chart.js"],
          link: null
        }
      ],
      testimonial: null
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleToggleExpand = (experienceId) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(experienceId)) {
        newSet.delete(experienceId);
      } else {
        newSet.add(experienceId);
      }
      return newSet;
    });
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  // Filter experiences based on active filters
  const filteredExperiences = experiences.filter(exp => {
    const industryMatch = activeFilters.industry === 'all' || 
      exp.industries.some(industry => 
        industry.toLowerCase().includes(activeFilters.industry.toLowerCase())
      );
    
    const roleMatch = activeFilters.role === 'all' || exp.role.toLowerCase().includes(activeFilters.role.replace('-', ' '));
    
    return industryMatch && roleMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading professional experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <Icon name="Briefcase" size={16} className="text-primary mr-2" />
            <span className="text-primary text-sm font-medium">Professional Journey</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Experience Timeline
          </h1>
          
          <p className="text-text-secondary text-lg max-w-3xl mx-auto mb-8">
            Explore my professional journey across development, data science, cinematography, and design. 
            Each role has contributed to building a unique multidisciplinary skill set.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              iconName="Download"
              iconPosition="left"
              onClick={() => document.getElementById('resume-download').scrollIntoView({ behavior: 'smooth' })}
              className="hover-glow"
            >
              Download Resume
            </Button>
            
            <Link to="/contact-collaboration-hub">
              <Button
                variant="outline"
                iconName="Mail"
                iconPosition="left"
              >
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>

        {/* Experience Statistics */}
        <ExperienceStats experiences={experiences} />

        {/* Timeline Filters */}
        <TimelineFilters
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          layout={layout}
          onLayoutChange={handleLayoutChange}
          totalExperiences={experiences.length}
          filteredCount={filteredExperiences.length}
        />

        {/* Skills Overview */}
        <SkillsOverview experiences={filteredExperiences} />

        {/* Timeline Container */}
        <div className="relative mb-12">
          {/* Timeline Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-primary">
              Professional Timeline
            </h2>
            <div className="text-text-secondary text-sm">
              {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience' : 'experiences'}
            </div>
          </div>

          {/* Timeline Entries */}
          <div className={`relative ${layout === 'horizontal' ? 'space-y-16' : 'space-y-8'}`}>
            {filteredExperiences.map((experience, index) => (
              <TimelineEntry
                key={experience.id}
                experience={experience}
                index={index}
                isExpanded={expandedEntries.has(experience.id)}
                onToggleExpand={handleToggleExpand}
                layout={layout}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredExperiences.length === 0 && (
            <div className="text-center py-16">
              <Icon name="Search" size={64} className="text-text-secondary mx-auto mb-4" />
              <h3 className="text-text-primary font-semibold text-xl mb-2">
                No experiences found
              </h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your filters to see more results.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setActiveFilters({ industry: 'all', role: 'all' });
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Resume Download Section */}
        <div id="resume-download" className="mb-12">
          <ResumeDownload />
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Ready to Collaborate?
          </h2>
          <p className="text-text-secondary text-lg mb-6 max-w-2xl mx-auto">
            I'm always interested in discussing new opportunities, innovative projects, 
            and ways to bring creative and technical solutions to life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/project-portfolio-gallery">
              <Button
                variant="primary"
                iconName="FolderOpen"
                iconPosition="left"
                className="hover-glow"
              >
                View My Projects
              </Button>
            </Link>
            <Link to="/contact-collaboration-hub">
              <Button
                variant="outline"
                iconName="MessageCircle"
                iconPosition="left"
              >
                Start a Conversation
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalExperienceTimeline;