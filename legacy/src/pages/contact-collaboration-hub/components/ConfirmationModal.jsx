import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConfirmationModal = ({ isOpen, onClose, formData }) => {
  if (!isOpen) return null;

  const getProjectTypeLabel = (type) => {
    const types = {
      'development': 'Web/Mobile Development',
      'data-science': 'Data Science & Analytics',
      'design': 'UI/UX Design',
      'cinematography': 'Cinematography & Video',
      'consulting': 'Technical Consulting',
      'other': 'Other'
    };
    return types[type] || type;
  };

  const getTimelineLabel = (timeline) => {
    const timelines = {
      'asap': 'ASAP (Rush Project)',
      '1-2weeks': '1-2 Weeks',
      '1month': '1 Month',
      '2-3months': '2-3 Months',
      '3+months': '3+ Months',
      'flexible': 'Flexible Timeline'
    };
    return timelines[timeline] || timeline;
  };

  const nextSteps = [
    {
      step: 1,
      title: 'Message Received',
      description: 'Your inquiry has been successfully submitted',
      icon: 'CheckCircle',
      status: 'completed'
    },
    {
      step: 2,
      title: 'Initial Review',
      description: 'I\'ll review your project details within 2-4 hours',
      icon: 'Eye',
      status: 'pending'
    },
    {
      step: 3,
      title: 'Response & Discussion',
      description: 'Detailed response with questions and next steps',
      icon: 'MessageCircle',
      status: 'upcoming'
    },
    {
      step: 4,
      title: 'Project Planning',
      description: 'Scope definition, timeline, and proposal',
      icon: 'FileText',
      status: 'upcoming'
    }
  ];

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'pending': return 'Clock';
      case 'upcoming': return 'Circle';
      default: return 'Circle';
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'upcoming': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <h2 className="text-text-primary font-semibold text-xl">
                Message Sent Successfully!
              </h2>
              <p className="text-text-secondary text-sm">
                Thank you for reaching out, {formData?.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-background hover:bg-primary/10 border border-border hover:border-primary/30 flex items-center justify-center text-text-secondary hover:text-primary transition-all"
            aria-label="Close modal"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Submission Summary */}
          <div className="bg-background rounded-lg p-4 border border-border">
            <h3 className="text-text-primary font-medium text-sm mb-3">
              Submission Summary
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Project Type:</span>
                <span className="text-text-primary font-medium">
                  {getProjectTypeLabel(formData?.projectType)}
                </span>
              </div>
              
              {formData?.timeline && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Timeline:</span>
                  <span className="text-text-primary font-medium">
                    {getTimelineLabel(formData?.timeline)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Submitted:</span>
                <span className="text-text-primary font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="text-text-primary font-medium text-sm mb-4">
              What Happens Next?
            </h3>
            
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={step.step} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    step.status === 'completed' 
                      ? 'bg-success/20 border-success' 
                      : step.status === 'pending' ?'bg-warning/20 border-warning' :'bg-surface border-border'
                  }`}>
                    <Icon 
                      name={getStepIcon(step.status)} 
                      size={14} 
                      className={getStepColor(step.status)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium text-sm">
                      {step.title}
                    </p>
                    <p className="text-text-secondary text-xs mt-1">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < nextSteps.length - 1 && (
                    <div className="absolute left-[19px] mt-8 w-0.5 h-4 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expected Response Time */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Clock" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-text-primary font-medium text-sm mb-1">
                  Expected Response Time
                </p>
                <p className="text-text-secondary text-xs">
                  I typically respond to project inquiries within 24 hours during business days. 
                  For urgent matters, feel free to reach out via WhatsApp or Telegram for faster response.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact Options */}
          <div>
            <h3 className="text-text-primary font-medium text-sm mb-3">
              Need Immediate Assistance?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => window.open('https://wa.me/15551234567', '_blank')}
                className="flex items-center space-x-3 p-3 bg-background hover:bg-primary/5 rounded-lg border border-border hover:border-primary/30 transition-all text-left"
              >
                <Icon name="MessageCircle" size={16} className="text-success" />
                <div>
                  <p className="text-text-primary font-medium text-sm">WhatsApp</p>
                  <p className="text-text-secondary text-xs">Quick response</p>
                </div>
              </button>
              
              <button
                onClick={() => window.open('https://t.me/muyahangwe', '_blank')}
                className="flex items-center space-x-3 p-3 bg-background hover:bg-primary/5 rounded-lg border border-border hover:border-primary/30 transition-all text-left"
              >
                <Icon name="Send" size={16} className="text-primary" />
                <div>
                  <p className="text-text-primary font-medium text-sm">Telegram</p>
                  <p className="text-text-secondary text-xs">Secure messaging</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <Icon name="Shield" size={12} />
            <span>Your information is secure and will not be shared</span>
          </div>
          
          <Button
            variant="primary"
            onClick={onClose}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;