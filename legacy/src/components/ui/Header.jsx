import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    { label: 'Home', path: '/portfolio-homepage', icon: 'Home' },
    { label: 'Projects', path: '/project-portfolio-gallery', icon: 'FolderOpen' },
    { label: 'Experience', path: '/professional-experience-timeline', icon: 'Briefcase' },
    { label: 'Contact', path: '/contact-collaboration-hub', icon: 'Mail' }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: 'Github', url: 'https://github.com' },
    { name: 'LinkedIn', icon: 'Linkedin', url: 'https://linkedin.com' },
    { name: 'Twitter', icon: 'Twitter', url: 'https://twitter.com' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSocialClick = (url, platform) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-100 transition-all duration-300 ${
          isScrolled ? 'bg-background/80 backdrop-blur-nav shadow-elevated' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link 
              to="/portfolio-homepage" 
              className="flex items-center space-x-2 group nav-transition hover-glow"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-lg lg:text-xl font-mono">M</span>
              </div>
              <span className="text-text-primary font-semibold text-lg lg:text-xl tracking-tight">
                Muyah
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-transition px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                    isActivePath(item.path)
                      ? 'text-primary bg-surface shadow-floating'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Social Links & Theme Toggle */}
            <div className="hidden lg:flex items-center space-x-4">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  onClick={() => handleSocialClick(social.url, social.name)}
                  className="text-text-secondary hover:text-primary nav-transition p-2 rounded-lg hover:bg-surface/50 hover-glow"
                  aria-label={`Visit ${social.name} profile`}
                >
                  <Icon name={social.icon} size={18} />
                </button>
              ))}
               <button
                  onClick={toggleTheme}
                  className="text-text-secondary hover:text-primary nav-transition p-2 rounded-lg hover:bg-surface/50 hover-glow"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface/50 nav-transition"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-90 lg:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-16 left-0 right-0 bg-surface/95 backdrop-blur-nav border-t border-border shadow-elevated animate-slide-in">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg nav-transition ${
                    isActivePath(item.path)
                      ? 'text-primary bg-primary/10 border border-primary/20' :'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile Social Links & Theme Toggle */}
              <div className="pt-4 border-t border-border">
                <p className="text-text-secondary text-sm font-medium mb-3 px-4">Connect</p>
                <div className="flex space-x-4 px-4">
                  {socialLinks.map((social) => (
                    <button
                      key={social.name}
                      onClick={() => handleSocialClick(social.url, social.name)}
                      className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary nav-transition hover-glow"
                      aria-label={`Visit ${social.name} profile`}
                    >
                      <Icon name={social.icon} size={20} />
                    </button>
                  ))}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary nav-transition hover-glow"
                    aria-label="Toggle theme"
                  >
                   {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Header;