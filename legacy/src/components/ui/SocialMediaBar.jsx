import React, { useState } from 'react';
import Icon from '../AppIcon';

const SocialMediaBar = ({ placement = 'header', className = '' }) => {
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const socialLinks = [
    { 
      name: 'GitHub', 
      icon: 'Github', 
      url: 'https://github.com',
      color: '#FFFFFF',
      description: 'View code repositories'
    },
    { 
      name: 'LinkedIn', 
      icon: 'Linkedin', 
      url: 'https://linkedin.com',
      color: '#0077B5',
      description: 'Professional network'
    },
    { 
      name: 'Twitter', 
      icon: 'Twitter', 
      url: 'https://twitter.com',
      color: '#1DA1F2',
      description: 'Latest updates'
    },
    { 
      name: 'Dribbble', 
      icon: 'Dribbble', 
      url: 'https://dribbble.com',
      color: '#EA4C89',
      description: 'Design portfolio'
    },
    { 
      name: 'Behance', 
      icon: 'Behance', 
      url: 'https://behance.net',
      color: '#1769FF',
      description: 'Creative projects'
    }
  ];

  const handleSocialClick = (url, platform) => {
    // Analytics tracking could be added here
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMouseEnter = (socialName) => {
    setHoveredSocial(socialName);
  };

  const handleMouseLeave = () => {
    setHoveredSocial(null);
  };

  // Header placement (horizontal layout)
  if (placement === 'header') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {socialLinks.map((social) => (
          <div key={social.name} className="relative">
            <button
              onClick={() => handleSocialClick(social.url, social.name)}
              onMouseEnter={() => handleMouseEnter(social.name)}
              onMouseLeave={handleMouseLeave}
              className="p-2 rounded-lg text-text-secondary hover:text-primary nav-transition hover:bg-surface/50 hover-glow group"
              aria-label={`Visit ${social.name} profile`}
            >
              <Icon 
                name={social.icon} 
                size={18} 
                className="group-hover:scale-110 transition-transform duration-200"
              />
            </button>
            
            {/* Tooltip */}
            {hoveredSocial === social.name && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-100">
                <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-elevated animate-fade-in">
                  <p className="text-text-primary text-xs font-medium whitespace-nowrap">
                    {social.description}
                  </p>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-surface border-l border-t border-border rotate-45" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Footer placement (vertical stack on mobile, horizontal on desktop)
  if (placement === 'footer') {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <p className="text-text-secondary text-sm font-medium">Connect with me</p>
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <button
                key={social.name}
                onClick={() => handleSocialClick(social.url, social.name)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary nav-transition hover-glow border border-border hover:border-primary/30"
                aria-label={`Visit ${social.name} profile`}
              >
                <Icon name={social.icon} size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Contact page placement (enhanced with descriptions)
  if (placement === 'contact') {
    return (
      <div className={`${className}`}>
        <h3 className="text-text-primary font-semibold text-lg mb-4">Let's Connect</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialLinks.map((social) => (
            <button
              key={social.name}
              onClick={() => handleSocialClick(social.url, social.name)}
              className="group p-4 bg-surface hover:bg-primary/5 rounded-xl border border-border hover:border-primary/30 nav-transition hover-glow text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center group-hover:bg-primary/10 nav-transition">
                  <Icon 
                    name={social.icon} 
                    size={20} 
                    className="text-text-secondary group-hover:text-primary nav-transition"
                  />
                </div>
                <div>
                  <p className="text-text-primary font-medium text-sm">{social.name}</p>
                  <p className="text-text-secondary text-xs group-hover:text-text-primary nav-transition">
                    {social.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-text-secondary group-hover:text-primary text-xs nav-transition">
                <span>Visit profile</span>
                <Icon name="ExternalLink" size={12} className="ml-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Sidebar placement (vertical layout)
  if (placement === 'sidebar') {
    return (
      <div className={`${className}`}>
        <div className="space-y-2">
          <p className="text-text-secondary text-xs font-medium mb-3">Social</p>
          {socialLinks.map((social) => (
            <button
              key={social.name}
              onClick={() => handleSocialClick(social.url, social.name)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-text-secondary hover:text-primary hover:bg-surface/50 nav-transition group"
              aria-label={`Visit ${social.name} profile`}
            >
              <Icon name={social.icon} size={18} />
              <span className="text-sm font-medium">{social.name}</span>
              <Icon 
                name="ExternalLink" 
                size={12} 
                className="ml-auto opacity-0 group-hover:opacity-100 nav-transition"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default placement
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {socialLinks.map((social) => (
        <button
          key={social.name}
          onClick={() => handleSocialClick(social.url, social.name)}
          className="p-2 rounded-lg text-text-secondary hover:text-primary nav-transition hover:bg-surface/50"
          aria-label={`Visit ${social.name} profile`}
        >
          <Icon name={social.icon} size={18} />
        </button>
      ))}
    </div>
  );
};

export default SocialMediaBar;