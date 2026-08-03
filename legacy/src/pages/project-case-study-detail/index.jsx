import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProjectNavigation from '../../components/ui/ProjectNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import page components
import ProjectHero from './components/ProjectHero';
import ProjectContent from './components/ProjectContent';
import RelatedProjects from './components/RelatedProjects';
import ProjectNavigationSidebar from './components/ProjectNavigation';
import SocialShare from './components/SocialShare';

const ProjectCaseStudyDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock project data
  const projectsData = {
    1: {
      id: 1,
      title: "E-Commerce Platform",
      category: "Web Development",
      type: "web",
      featured: true,
      description: "A comprehensive e-commerce platform built with modern web technologies, featuring real-time inventory management, secure payment processing, and advanced analytics dashboard.",
      heroImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
      overview: `This e-commerce platform was designed to revolutionize online retail experiences by combining cutting-edge technology with user-centric design principles. The project aimed to create a scalable, secure, and intuitive platform that could handle high-volume transactions while providing seamless user experiences across all devices.\n\nThe platform integrates advanced features such as AI-powered product recommendations, real-time inventory tracking, multi-currency support, and comprehensive analytics dashboards for both customers and administrators.`,
      problem: "Traditional e-commerce platforms often struggle with scalability, security vulnerabilities, and poor user experience. Many existing solutions lack real-time inventory management, leading to overselling and customer dissatisfaction. Additionally, most platforms don't provide comprehensive analytics or personalized shopping experiences.",
      solution: "Developed a modern, microservices-based e-commerce platform using React.js for the frontend and Node.js with Express for the backend. Implemented real-time features using WebSocket connections, integrated secure payment gateways, and created an AI-powered recommendation engine using machine learning algorithms.",
      features: [
        "Real-time inventory management with automatic stock updates",
        "AI-powered product recommendation system",
        "Multi-currency and multi-language support",
        "Advanced analytics dashboard with real-time metrics",
        "Secure payment processing with multiple gateway options",
        "Mobile-responsive design with PWA capabilities",
        "Admin panel with comprehensive order and user management",
        "SEO-optimized product pages with dynamic meta tags"
      ],
      technologies: ["React.js", "Node.js", "Express", "MongoDB", "Redis", "Stripe API", "AWS S3", "Docker"],
      duration: "6 months",
      role: "Full Stack Developer",
      team: "4 developers",
      year: "2023",
      liveUrl: "https://ecommerce-demo.example.com",
      githubUrl: "https://github.com/muyah/ecommerce-platform",
      gallery: [
        {
          url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
          caption: "Homepage with featured products and categories"
        },
        {
          url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
          caption: "Product detail page with reviews and recommendations"
        },
        {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          caption: "Admin dashboard with analytics and metrics"
        },
        {
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          caption: "Mobile responsive design and checkout process"
        }
      ],
      technicalDetails: [
        {
          title: "Frontend Architecture",
          description: "Built with React.js using functional components and hooks for state management. Implemented Redux Toolkit for global state management and React Router for navigation. Used Tailwind CSS for responsive styling and Framer Motion for smooth animations.",
          codeSnippet: `// Product component with hooks
const ProductCard = ({ product }) => {
  const [isInCart, setIsInCart] = useState(false);
  const dispatch = useDispatch();
  
  const handleAddToCart = () => {
    dispatch(addToCart(product));
    setIsInCart(true);
  };
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>
        {isInCart ? 'Added!' : 'Add to Cart'}
      </button>
    </div>
  );
};`
        },
        {
          title: "Backend API Design",
          description: "Developed RESTful APIs using Node.js and Express.js with JWT authentication. Implemented rate limiting, input validation, and comprehensive error handling. Used MongoDB for data persistence with Mongoose ODM.",
          codeSnippet: `// Product API endpoint
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const filter = category ? { category } : {};
    
    const products = await Product.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    res.json({
      products,
      totalPages: Math.ceil(await Product.countDocuments(filter) / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`
        },
        {
          title: "Real-time Features",
          description: "Implemented WebSocket connections for real-time inventory updates and order notifications. Used Redis for caching frequently accessed data and session management.",
          codeSnippet: `// WebSocket implementation for real-time updates
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join-product', (productId) => {
    socket.join(\`product-\${productId}\`);
  });
  
  // Emit inventory updates
  socket.on('inventory-update', (data) => {
    io.to(\`product-\${data.productId}\`).emit('stock-changed', {
      productId: data.productId,
      newStock: data.stock
    });
  });
});`
        }
      ],
      results: [
        {
          icon: "TrendingUp",
          value: "150%",
          label: "Increase in Sales"
        },
        {
          icon: "Users",
          value: "10K+",
          label: "Active Users"
        },
        {
          icon: "Zap",
          value: "2.3s",
          label: "Page Load Time"
        }
      ],
      impact: "The platform successfully increased client sales by 150% within the first quarter of launch. The real-time inventory management reduced overselling incidents by 95%, and the AI-powered recommendation system improved average order value by 40%. The mobile-responsive design contributed to a 60% increase in mobile conversions."
    },
    2: {
      id: 2,
      title: "Mobile Banking App",
      category: "Mobile Development",
      type: "mobile",
      featured: false,
      description: "Secure mobile banking application with biometric authentication, real-time transaction monitoring, and comprehensive financial management tools.",
      heroImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
      overview: `A comprehensive mobile banking solution designed to provide users with secure, convenient, and feature-rich banking services on their mobile devices. The app incorporates advanced security measures, intuitive user interface design, and real-time financial data processing to deliver a superior banking experience.\n\nThe application supports multiple account types, international transfers, bill payments, and investment tracking, all while maintaining the highest security standards required for financial applications.`,
      problem: "Traditional banking apps often lack user-friendly interfaces and comprehensive features. Many existing solutions have security vulnerabilities, slow transaction processing, and limited functionality for modern banking needs. Users frequently struggle with complex navigation and lack of real-time financial insights.",
      solution: "Developed a React Native mobile application with end-to-end encryption, biometric authentication, and real-time transaction processing. Implemented a microservices architecture for scalability and integrated with multiple banking APIs for comprehensive financial services.",
      features: [
        "Biometric authentication (fingerprint and face recognition)",
        "Real-time transaction monitoring and notifications",
        "Multi-account management with different account types",
        "International money transfers with competitive rates",
        "Bill payment automation and scheduling",
        "Investment portfolio tracking and management",
        "Budgeting tools with spending analytics",
        "24/7 customer support chat integration"
      ],
      technologies: ["React Native", "Node.js", "PostgreSQL", "Redis", "JWT", "Plaid API", "Stripe Connect"],
      duration: "4 months",
      role: "Mobile Developer",
      team: "3 developers",
      year: "2023",
      liveUrl: "https://apps.apple.com/banking-app",
      githubUrl: "https://github.com/muyah/mobile-banking",
      gallery: [
        {
          url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
          caption: "Login screen with biometric authentication"
        },
        {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          caption: "Dashboard with account overview and quick actions"
        },
        {
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          caption: "Transaction history with detailed analytics"
        }
      ],
      technicalDetails: [
        {
          title: "Security Implementation",
          description: "Implemented multi-layer security including biometric authentication, end-to-end encryption, and secure token management. Used React Native Keychain for secure storage and implemented certificate pinning for API communications."
        },
        {
          title: "Real-time Processing",
          description: "Built real-time transaction processing system using WebSocket connections and Redis for caching. Implemented push notifications for transaction alerts and account updates."
        }
      ],
      results: [
        {
          icon: "Shield",
          value: "99.9%",
          label: "Security Score"
        },
        {
          icon: "Clock",
          value: "1.2s",
          label: "Transaction Time"
        },
        {
          icon: "Star",
          value: "4.8",
          label: "App Store Rating"
        }
      ],
      impact: "The mobile banking app achieved a 4.8-star rating on app stores and processed over $10M in transactions within the first month. The biometric authentication feature increased user login rates by 80%, and the real-time notifications reduced fraud incidents by 65%."
    }
  };

  useEffect(() => {
    // Get project ID from URL params
    const urlParams = new URLSearchParams(location.search);
    const projectId = urlParams.get('id') || '1';
    
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      const projectData = projectsData[projectId];
      if (projectData) {
        setProject(projectData);
      } else {
        // Redirect to gallery if project not found
        navigate('/project-portfolio-gallery');
      }
      setLoading(false);
    }, 500);
  }, [location.search, navigate]);

  const handleBackToGallery = () => {
    navigate('/project-portfolio-gallery');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
            <h2 className="text-text-primary text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-text-secondary mb-6">The project you're looking for doesn't exist.</p>
            <Button variant="primary" onClick={handleBackToGallery}>
              Back to Gallery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative">
        {/* Project Navigation Sidebar */}
        <ProjectNavigationSidebar />
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Breadcrumb />
          
          {/* Back Button & Share */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToGallery}
              iconName="ArrowLeft"
              iconPosition="left"
              size="sm"
            >
              Back to Gallery
            </Button>
            
            <SocialShare project={project} />
          </div>

          {/* Project Hero Section */}
          <div id="overview">
            <ProjectHero project={project} />
          </div>

          {/* Project Content Sections */}
          <div className="mt-16">
            <div id="problem" className="scroll-mt-24">
              <ProjectContent project={project} />
            </div>
          </div>

          {/* Related Projects */}
          <RelatedProjects currentProjectId={project.id} />
        </div>

        {/* Project Navigation (Mobile/Desktop) */}
        <ProjectNavigation />
      </main>
    </div>
  );
};

export default ProjectCaseStudyDetail;