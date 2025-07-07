import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const routeMap = {
    '/portfolio-homepage': { label: 'Home', icon: 'Home' },
    '/project-portfolio-gallery': { label: 'Projects', icon: 'FolderOpen' },
    '/professional-experience-timeline': { label: 'Experience', icon: 'Briefcase' },
    '/contact-collaboration-hub': { label: 'Contact', icon: 'Mail' },
    '/project-case-study-detail': { label: 'Case Study', icon: 'FileText', parent: '/project-portfolio-gallery' }
  };

  const currentRoute = routeMap[location.pathname];
  
  if (!currentRoute || location.pathname === '/portfolio-homepage') {
    return null;
  }

  const breadcrumbItems = [];
  
  // Add home
  breadcrumbItems.push({
    label: 'Home',
    path: '/portfolio-homepage',
    icon: 'Home'
  });

  // Add parent if exists
  if (currentRoute.parent) {
    const parentRoute = routeMap[currentRoute.parent];
    if (parentRoute) {
      breadcrumbItems.push({
        label: parentRoute.label,
        path: currentRoute.parent,
        icon: parentRoute.icon
      });
    }
  }

  // Add current page
  breadcrumbItems.push({
    label: currentRoute.label,
    path: location.pathname,
    icon: currentRoute.icon,
    current: true
  });

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-text-secondary mx-2" 
              />
            )}
            {item.current ? (
              <span className="flex items-center space-x-2 text-text-primary font-medium">
                <Icon name={item.icon} size={16} className="text-primary" />
                <span>{item.label}</span>
              </span>
            ) : (
              <Link
                to={item.path}
                className="flex items-center space-x-2 text-text-secondary hover:text-primary nav-transition hover:underline"
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;