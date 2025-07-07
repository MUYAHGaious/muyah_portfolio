import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ContactForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    timeline: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = [
    { value: 'development', label: 'Web/Mobile Development' },
    { value: 'data-science', label: 'Data Science & Analytics' },
    { value: 'design', label: 'UI/UX Design' },
    { value: 'cinematography', label: 'Cinematography & Video' },
    { value: 'consulting', label: 'Technical Consulting' },
    { value: 'other', label: 'Other' }
  ];

  const timelines = [
    { value: 'asap', label: 'ASAP (Rush Project)' },
    { value: '1-2weeks', label: '1-2 Weeks' },
    { value: '1month', label: '1 Month' },
    { value: '2-3months', label: '2-3 Months' },
    { value: '3+months', label: '3+ Months' },
    { value: 'flexible', label: 'Flexible Timeline' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Please select a project type';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        projectType: '',
        timeline: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-text-primary font-semibold text-xl lg:text-2xl mb-2">
          Let's Work Together
        </h2>
        <p className="text-text-secondary text-sm lg:text-base">
          Ready to bring your project to life? Fill out the form below and I'll get back to you within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-text-primary text-sm font-medium mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={errors.name ? 'border-error' : ''}
            />
            {errors.name && (
              <p className="text-error text-xs mt-1 flex items-center">
                <Icon name="AlertCircle" size={12} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-text-primary text-sm font-medium mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className={errors.email ? 'border-error' : ''}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1 flex items-center">
                <Icon name="AlertCircle" size={12} className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Project Type and Timeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="projectType" className="block text-text-primary text-sm font-medium mb-2">
              Project Type *
            </label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.projectType ? 'border-error' : 'border-border'
              }`}
            >
              <option value="">Select project type</option>
              {projectTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.projectType && (
              <p className="text-error text-xs mt-1 flex items-center">
                <Icon name="AlertCircle" size={12} className="mr-1" />
                {errors.projectType}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="timeline" className="block text-text-primary text-sm font-medium mb-2">
              Expected Timeline
            </label>
            <select
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option value="">Select timeline</option>
              {timelines.map(timeline => (
                <option key={timeline.value} value={timeline.value}>
                  {timeline.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-text-primary text-sm font-medium mb-2">
            Project Details *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={6}
            placeholder="Tell me about your project, goals, requirements, and any specific details that would help me understand your vision better..."
            className={`w-full px-3 py-2 bg-background border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-vertical ${
              errors.message ? 'border-error' : 'border-border'
            }`}
          />
          {errors.message && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.message}
            </p>
          )}
          <p className="text-text-secondary text-xs mt-1">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            iconName={isSubmitting ? undefined : "Send"}
            iconPosition="right"
            fullWidth
            className="h-12"
          >
            {isSubmitting ? 'Sending Message...' : 'Send Message'}
          </Button>
          
          <p className="text-text-secondary text-xs mt-3 text-center">
            I typically respond within 24 hours. For urgent inquiries, use WhatsApp or Telegram.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;