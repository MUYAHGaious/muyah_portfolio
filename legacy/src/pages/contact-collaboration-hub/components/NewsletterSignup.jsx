import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const benefits = [
    {
      icon: 'Code',
      title: 'Latest Projects',
      description: 'Get notified about new projects and case studies'
    },
    {
      icon: 'TrendingUp',
      title: 'Industry Insights',
      description: 'Tech trends, best practices, and development tips'
    },
    {
      icon: 'Lightbulb',
      title: 'Behind the Scenes',
      description: 'Process insights and creative development stories'
    },
    {
      icon: 'Users',
      title: 'Community Updates',
      description: 'Collaboration opportunities and networking events'
    }
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 lg:p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-success" />
          </div>
          
          <h3 className="text-text-primary font-semibold text-xl mb-2">
            Welcome to the Newsletter!
          </h3>
          
          <p className="text-text-secondary text-sm mb-6">
            Thank you for subscribing! You'll receive updates about new projects, insights, and opportunities directly in your inbox.
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="Shield" size={14} />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Mail" size={14} />
              <span>No Spam</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="X" size={14} />
              <span>Unsubscribe Anytime</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6 lg:p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Mail" size={24} className="text-primary" />
        </div>
        
        <h3 className="text-text-primary font-semibold text-xl mb-2">
          Stay Updated
        </h3>
        
        <p className="text-text-secondary text-sm">
          Join my newsletter to get the latest updates on projects, insights, and collaboration opportunities.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-background rounded-lg">
            <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={benefit.icon} size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-text-primary font-medium text-sm mb-1">
                {benefit.title}
              </p>
              <p className="text-text-secondary text-xs">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            className={error ? 'border-error' : ''}
          />
          {error && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {error}
            </p>
          )}
        </div>

        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          iconName={isSubmitting ? undefined : "Send"}
          iconPosition="right"
          fullWidth
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </Button>
      </form>

      {/* Privacy Notice */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-start space-x-2">
          <Icon name="Shield" size={16} className="text-success mt-0.5" />
          <div>
            <p className="text-text-primary text-sm font-medium mb-1">
              Your Privacy Matters
            </p>
            <p className="text-text-secondary text-xs">
              I respect your privacy and will never share your email address. You can unsubscribe at any time with one click. No spam, just valuable content delivered monthly.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-text-secondary">
        <div className="flex items-center space-x-1">
          <Icon name="Users" size={12} />
          <span>500+ Subscribers</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Calendar" size={12} />
          <span>Monthly Updates</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Star" size={12} />
          <span>4.9/5 Rating</span>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;