import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResumeDownload = ({ className = '' }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(247); // Mock download count

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Simulate download process
    setTimeout(() => {
      // In a real app, this would trigger actual file download
      const link = document.createElement('a');
      link.href = '/assets/documents/muyah-gaious-angwe-resume.pdf';
      link.download = 'Muyah_Gaious_Angwe_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadCount(prev => prev + 1);
      setIsDownloading(false);
    }, 1500);
  };

  const handlePreview = () => {
    window.open('/assets/documents/muyah-gaious-angwe-resume.pdf', '_blank');
  };

  return (
    <div className={`bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Resume Icon */}
        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name="FileText" size={24} className="text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold text-lg mb-1">
            Download Resume
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            Get a comprehensive overview of my professional experience, skills, and achievements in PDF format.
          </p>

          {/* Resume Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={14} className="text-text-secondary" />
              <span className="text-text-secondary">Updated: Dec 2024</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Download" size={14} className="text-text-secondary" />
              <span className="text-text-secondary">{downloadCount.toLocaleString()} downloads</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="FileType" size={14} className="text-text-secondary" />
              <span className="text-text-secondary">PDF Format</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="HardDrive" size={14} className="text-text-secondary" />
              <span className="text-text-secondary">2.3 MB</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={handleDownload}
              loading={isDownloading}
              iconName="Download"
              iconPosition="left"
              className="flex-1 sm:flex-none hover-glow"
            >
              {isDownloading ? 'Preparing Download...' : 'Download Resume'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePreview}
              iconName="Eye"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Preview
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-background/50 border border-border rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-text-primary text-xs font-medium mb-1">
                  What's included:
                </p>
                <ul className="text-text-secondary text-xs space-y-1">
                  <li>• Complete work history with achievements</li>
                  <li>• Technical skills and proficiency levels</li>
                  <li>• Education and certifications</li>
                  <li>• Contact information and references</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDownload;