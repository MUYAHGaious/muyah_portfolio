import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from 'components/ui/Header';
import SocialMediaBar from 'components/ui/SocialMediaBar';
import HeroSection from './components/HeroSection';
import BioSection from './components/BioSection';
import TechStackGrid from './components/TechStackGrid';
import SkillsCards from './components/SkillsCards';
import FeaturedProjects from './components/FeaturedProjects';

const PortfolioHomepage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Apply dark mode by default
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <>
      <Helmet>
        <title>Muyah - Portfolio Homepage | Full Stack Developer, Data Scientist & Creative</title>
        <meta 
          name="description" 
          content="Muyah's professional portfolio showcasing expertise in full stack development, data science, cinematography, and design. Discover innovative projects and creative solutions." 
        />
        <meta 
          name="keywords" 
          content="Muyah, portfolio, full stack developer, data scientist, cinematographer, web developer, React, Node.js, Python, creative professional" 
        />
        <meta name="author" content="Muyah" />
        <meta property="og:title" content="Muyah - Portfolio Homepage" />
        <meta property="og:description" content="Multidisciplinary professional specializing in full stack development, data science, and creative storytelling." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://muyah.dev/portfolio-homepage" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Muyah - Portfolio Homepage" />
        <meta name="twitter:description" content="Full Stack Developer, Data Scientist & Creative Professional" />
        <link rel="canonical" href="https://muyah.dev/portfolio-homepage" />
      </Helmet>

      <div className="min-h-screen bg-background text-text-primary">
        {/* Header */}
        <Header />

        {/* Dark Mode Toggle - Floating Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          onClick={toggleDarkMode}
          className="fixed top-20 right-4 z-90 p-3 bg-surface border border-border rounded-full shadow-elevated hover:shadow-floating transition-all duration-300 hover:scale-110 lg:top-24 lg:right-8"
          aria-label="Toggle dark mode"
        >
          <motion.div
            animate={{ rotate: darkMode ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </motion.div>
        </motion.button>

        {/* Main Content */}
        <main className="overflow-hidden">
          {/* Hero Section */}
          <HeroSection />

          {/* Bio Section */}
          <BioSection />

          {/* Tech Stack Section */}
          <TechStackGrid />

          {/* Skills Section */}
          <SkillsCards />

          {/* Featured Projects Section */}
          <FeaturedProjects />
        </main>

        {/* Footer */}
        <footer className="bg-surface/50 border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo and Description */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <span className="text-background font-bold text-lg font-mono">M</span>
                  </div>
                  <span className="text-text-primary font-semibold text-lg">Muyah</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Multidisciplinary professional passionate about creating innovative solutions 
                  at the intersection of technology and creativity.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-text-primary font-semibold">Quick Links</h4>
                <div className="space-y-2">
                  {[
                    { label: 'About', href: '#bio' },
                    { label: 'Skills', href: '#skills' },
                    { label: 'Projects', href: '#featured-projects' },
                    { label: 'Contact', href: '/contact-collaboration-hub' }
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="block text-text-secondary hover:text-primary transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="text-text-primary font-semibold">Connect</h4>
                <SocialMediaBar placement="footer" />
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-text-secondary text-sm">
                © {new Date().getFullYear()} Muyah. All rights reserved. Built with React & Tailwind CSS.
              </p>
            </div>
          </div>
        </footer>

        {/* Scroll Progress Indicator */}
        {isScrolled && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent z-100 origin-left"
            style={{
              scaleX: isScrolled ? 1 : 0,
              transformOrigin: '0%'
            }}
          />
        )}
      </div>
    </>
  );
};

export default PortfolioHomepage;