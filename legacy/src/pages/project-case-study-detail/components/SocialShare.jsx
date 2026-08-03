import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SocialShare = ({ project }) => {
  const [copied, setCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const currentUrl = window.location.href;
  const shareText = `Check out this amazing project: ${project.title}`;

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: '#0077B5'
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      color: '#1877F2'
    },
    {
      name: 'Reddit',
      icon: 'MessageCircle',
      url: `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`,
      color: '#FF4500'
    }
  ];

  const handleShare = (platform) => {
    window.open(platform.url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    setIsShareMenuOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsShareMenuOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: shareText,
          url: currentUrl
        });
        setIsShareMenuOpen(false);
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      setIsShareMenuOpen(!isShareMenuOpen);
    }
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <Button
        variant="outline"
        onClick={handleNativeShare}
        iconName="Share2"
        iconPosition="left"
        size="sm"
        className="relative"
      >
        Share Project
      </Button>

      {/* Share Menu */}
      {isShareMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsShareMenuOpen(false)}
          />
          
          {/* Share Options */}
          <div className="absolute top-full right-0 mt-2 z-50 bg-surface border border-border rounded-xl shadow-elevated p-4 w-64 animate-fade-in">
            <h3 className="text-text-primary font-semibold text-sm mb-3">Share this project</h3>
            
            {/* Social Platforms */}
            <div className="space-y-2 mb-4">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-background nav-transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                    <Icon name={platform.icon} size={16} className="text-text-secondary" />
                  </div>
                  <span className="text-text-secondary text-sm">Share on {platform.name}</span>
                </button>
              ))}
            </div>

            {/* Copy Link */}
            <div className="pt-3 border-t border-border">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-background nav-transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                  <Icon 
                    name={copied ? "Check" : "Copy"} 
                    size={16} 
                    className={copied ? "text-success" : "text-text-secondary"} 
                  />
                </div>
                <span className={`text-sm ${copied ? "text-success" : "text-text-secondary"}`}>
                  {copied ? "Link copied!" : "Copy link"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Toast */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-100 bg-success text-success-foreground px-4 py-2 rounded-lg shadow-elevated animate-fade-in">
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={16} />
            <span className="text-sm font-medium">Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShare;