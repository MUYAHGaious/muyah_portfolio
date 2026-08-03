import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechFlow Solutions",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: `Muyah delivered an exceptional e-commerce platform that exceeded our expectations. His attention to detail and ability to translate complex requirements into elegant solutions is remarkable. The project was completed on time and within budget.`,
      rating: 5,
      project: "E-Commerce Platform",
      date: "2024-01-15"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Data Science Director",
      company: "Analytics Pro",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: `Working with Muyah on our data visualization dashboard was a game-changer. His expertise in both data science and frontend development allowed him to create intuitive interfaces that made complex data accessible to our entire team.`,
      rating: 5,
      project: "Data Visualization Dashboard",
      date: "2024-02-20"
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "Creative Director",
      company: "Brand Studio",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: `Muyah's cinematography work for our brand campaign was absolutely stunning. His creative vision and technical expertise brought our story to life in ways we never imagined. Highly recommend for any video production needs.`,
      rating: 5,
      project: "Brand Campaign Video",
      date: "2024-03-10"
    },
    {
      id: 4,
      name: "David Kim",
      role: "CTO",
      company: "StartupLab",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: `Muyah's full-stack development skills are top-notch. He built our MVP from scratch and helped us scale it to handle thousands of users. His code quality and architectural decisions have been crucial to our success.`,
      rating: 5,
      project: "MVP Development",
      date: "2024-01-30"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "UX Designer",
      company: "Design Collective",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      content: `Collaborating with Muyah on UI/UX projects has been fantastic. He understands design principles deeply and can implement pixel-perfect interfaces. His feedback during the design process always adds value.`,
      rating: 5,
      project: "Mobile App Design",
      date: "2024-02-05"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Research Lead",
      company: "AI Research Institute",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      content: `Muyah's work on our machine learning pipeline was exceptional. His ability to bridge the gap between research and practical implementation helped us deploy our models successfully in production.`,
      rating: 5,
      project: "ML Pipeline Development",
      date: "2024-03-25"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={index < rating ? 'text-warning fill-current' : 'text-text-secondary'}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="MessageSquare" size={20} className="text-primary" />
          <h3 className="text-text-primary font-semibold text-lg">Client Testimonials</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="w-8 h-8 rounded-lg bg-background hover:bg-primary/10 border border-border hover:border-primary/30 flex items-center justify-center text-text-secondary hover:text-primary transition-all"
            aria-label="Previous testimonial"
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          
          <button
            onClick={goToNext}
            className="w-8 h-8 rounded-lg bg-background hover:bg-primary/10 border border-border hover:border-primary/30 flex items-center justify-center text-text-secondary hover:text-primary transition-all"
            aria-label="Next testimonial"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* Testimonial Content */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0">
              <div className="space-y-4">
                {/* Quote */}
                <div className="relative">
                  <Icon 
                    name="Quote" 
                    size={24} 
                    className="text-primary/30 absolute -top-2 -left-1" 
                  />
                  <p className="text-text-primary text-sm lg:text-base leading-relaxed pl-6">
                    {testimonial.content}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 pl-6">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Author Info */}
                <div className="flex items-center space-x-4 pl-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-background">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-text-primary font-medium text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-text-secondary text-xs">
                      {testimonial.project}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {formatDate(testimonial.date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-primary w-6' :'bg-text-secondary hover:bg-primary/50'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-text-primary font-semibold text-lg">50+</p>
            <p className="text-text-secondary text-xs">Happy Clients</p>
          </div>
          <div>
            <p className="text-text-primary font-semibold text-lg">4.9/5</p>
            <p className="text-text-secondary text-xs">Average Rating</p>
          </div>
          <div>
            <p className="text-text-primary font-semibold text-lg">100%</p>
            <p className="text-text-secondary text-xs">Project Success</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;