import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactInfo = () => {
  const contactMethods = [
    {
      type: 'email',
      label: 'Email',
      value: 'muyah.angwe@example.com',
      icon: 'Mail',
      description: 'Professional inquiries & detailed discussions',
      action: () => window.open('mailto:muyah.angwe@example.com', '_blank'),
      priority: 'high',
      responseTime: '24 hours'
    },
    {
      type: 'whatsapp',
      label: 'WhatsApp',
      value: '+1 (555) 123-4567',
      icon: 'MessageCircle',
      description: 'Quick questions & immediate responses',
      action: () => window.open('https://wa.me/15551234567', '_blank'),
      priority: 'urgent',
      responseTime: '2-4 hours'
    },
    {
      type: 'telegram',
      label: 'Telegram',
      value: '@muyahangwe',
      icon: 'Send',
      description: 'Secure messaging & file sharing',
      action: () => window.open('https://t.me/muyahangwe', '_blank'),
      priority: 'urgent',
      responseTime: '2-4 hours'
    },
    {
      type: 'linkedin',
      label: 'LinkedIn',
      value: 'Muyah Gaious Angwe',
      icon: 'Linkedin',
      description: 'Professional networking & career opportunities',
      action: () => window.open('https://linkedin.com/in/muyahangwe', '_blank'),
      priority: 'medium',
      responseTime: '48 hours'
    }
  ];

  const workingHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
    { day: 'Saturday', hours: '10:00 AM - 2:00 PM EST' },
    { day: 'Sunday', hours: 'Emergency only' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return 'Fastest Response';
      case 'high': return 'Quick Response';
      case 'medium': return 'Standard Response';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Methods */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Phone" size={20} className="text-primary" />
          <h3 className="text-text-primary font-semibold text-lg">Get In Touch</h3>
        </div>
        
        <div className="space-y-4">
          {contactMethods.map((method) => (
            <div
              key={method.type}
              className="group p-4 bg-background hover:bg-primary/5 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer"
              onClick={method.action}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-surface group-hover:bg-primary/10 rounded-lg flex items-center justify-center transition-colors">
                  <Icon 
                    name={method.icon} 
                    size={18} 
                    className="text-text-secondary group-hover:text-primary transition-colors"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-text-primary font-medium text-sm">
                      {method.label}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full bg-surface ${getPriorityColor(method.priority)}`}>
                      {getPriorityBadge(method.priority)}
                    </span>
                  </div>
                  
                  <p className="text-text-primary text-sm font-mono mb-1">
                    {method.value}
                  </p>
                  
                  <p className="text-text-secondary text-xs mb-2">
                    {method.description}
                  </p>
                  
                  <div className="flex items-center text-xs text-text-secondary">
                    <Icon name="Clock" size={12} className="mr-1" />
                    <span>Response time: {method.responseTime}</span>
                  </div>
                </div>
                
                <Icon 
                  name="ExternalLink" 
                  size={14} 
                  className="text-text-secondary group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Calendar" size={20} className="text-primary" />
          <h3 className="text-text-primary font-semibold text-lg">Working Hours</h3>
        </div>
        
        <div className="space-y-3">
          {workingHours.map((schedule, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-text-secondary text-sm">{schedule.day}</span>
              <span className="text-text-primary text-sm font-medium">{schedule.hours}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div>
              <p className="text-text-primary text-sm font-medium mb-1">
                Time Zone: Eastern Standard Time (EST)
              </p>
              <p className="text-text-secondary text-xs">
                For urgent matters outside working hours, use WhatsApp or Telegram for faster response.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="MapPin" size={20} className="text-primary" />
          <h3 className="text-text-primary font-semibold text-lg">Location</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Icon name="Globe" size={16} className="text-text-secondary mt-1" />
            <div>
              <p className="text-text-primary text-sm font-medium">Remote Work Available</p>
              <p className="text-text-secondary text-xs">
                Available for remote collaboration worldwide
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Icon name="Building" size={16} className="text-text-secondary mt-1" />
            <div>
              <p className="text-text-primary text-sm font-medium">Based in New York, USA</p>
              <p className="text-text-secondary text-xs">
                Available for local meetings and on-site projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-text-primary font-semibold text-lg mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          <Button
            variant="primary"
            iconName="Download"
            iconPosition="left"
            fullWidth
            onClick={() => window.open('/assets/resume/muyah-angwe-resume.pdf', '_blank')}
          >
            Download Resume
          </Button>
          
          <Button
            variant="outline"
            iconName="Calendar"
            iconPosition="left"
            fullWidth
            onClick={() => window.open('https://calendly.com/muyahangwe', '_blank')}
          >
            Schedule a Call
          </Button>
          
          <Button
            variant="ghost"
            iconName="Github"
            iconPosition="left"
            fullWidth
            onClick={() => window.open('https://github.com/muyahangwe', '_blank')}
          >
            View GitHub Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;