import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import SocialMediaBar from '../../components/ui/SocialMediaBar';
import ContactForm from './components/ContactForm';
import ContactInfo from './components/ContactInfo';
import NewsletterSignup from './components/NewsletterSignup';
import TestimonialsCarousel from './components/TestimonialsCarousel';
import ConfirmationModal from './components/ConfirmationModal';
import Icon from '../../components/AppIcon';

const ContactCollaborationHub = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedFormData, setSubmittedFormData] = useState(null);

  const handleFormSubmit = (formData) => {
    setSubmittedFormData(formData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmittedFormData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Icon name="MessageCircle" size={16} className="text-primary" />
            <span className="text-primary text-sm font-medium">Let's Collaborate</span>
          </div>
          
          <h1 className="text-text-primary font-bold text-3xl lg:text-5xl mb-4">
            Contact & Collaboration Hub
          </h1>
          
          <p className="text-text-secondary text-lg lg:text-xl max-w-3xl mx-auto mb-8">
            Ready to bring your vision to life? Whether you need development, data science, design, or cinematography services, I'm here to help turn your ideas into reality.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-text-primary font-semibold text-xl">24h</p>
              <p className="text-text-secondary text-sm">Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-text-primary font-semibold text-xl">50+</p>
              <p className="text-text-secondary text-sm">Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-text-primary font-semibold text-xl">4.9/5</p>
              <p className="text-text-secondary text-sm">Client Rating</p>
            </div>
            <div className="text-center">
              <p className="text-text-primary font-semibold text-xl">100%</p>
              <p className="text-text-secondary text-sm">Project Success</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm onSubmit={handleFormSubmit} />
          </div>
          
          {/* Right Column - Contact Info */}
          <div className="lg:col-span-1">
            <ContactInfo />
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-12">
          <NewsletterSignup />
        </div>

        {/* Testimonials Section */}
        <div className="mb-12">
          <TestimonialsCarousel />
        </div>

        {/* Social Media Section */}
        <div className="bg-surface rounded-xl border border-border p-6 lg:p-8 mb-12">
          <SocialMediaBar placement="contact" />
        </div>

        {/* FAQ Section */}
        <div className="bg-surface rounded-xl border border-border p-6 lg:p-8">
          <div className="text-center mb-8">
            <h2 className="text-text-primary font-semibold text-2xl mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary">
              Common questions about working together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="text-text-primary font-medium text-sm mb-2">
                  What's your typical response time?
                </h3>
                <p className="text-text-secondary text-xs">
                  I respond to all inquiries within 24 hours during business days. For urgent matters, WhatsApp or Telegram provide faster response times (2-4 hours).
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="text-text-primary font-medium text-sm mb-2">
                  Do you work with international clients?
                </h3>
                <p className="text-text-secondary text-xs">
                  Absolutely! I work with clients worldwide and am experienced in remote collaboration across different time zones.
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="text-text-primary font-medium text-sm mb-2">
                  What information should I include in my inquiry?
                </h3>
                <p className="text-text-secondary text-xs">
                  Please include project goals, timeline, budget range, and any specific requirements. The more details you provide, the better I can assist you.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="text-text-primary font-medium text-sm mb-2">
                  Do you offer free consultations?
                </h3>
                <p className="text-text-secondary text-xs">
                  Yes! I offer a free 30-minute consultation to discuss your project and determine if we're a good fit for collaboration.
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="text-text-primary font-medium text-sm mb-2">
                  What's your project minimum?
                </h3>
                <p className="text-text-secondary text-xs">
                  Project minimums vary by service type. Development projects start at $2,500, while design and cinematography projects have flexible minimums based on scope.
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="text-text-primary font-medium text-sm mb-2">
                  How do you handle project payments?
                </h3>
                <p className="text-text-secondary text-xs">
                  I typically work with 50% upfront and 50% upon completion for smaller projects. Larger projects are broken into milestones with payments tied to deliverables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-text-secondary text-sm mb-4">
              © {new Date().getFullYear()} Muyah Gaious Angwe. All rights reserved.
            </p>
            <SocialMediaBar placement="footer" />
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={submittedFormData}
      />
    </div>
  );
};

export default ContactCollaborationHub;