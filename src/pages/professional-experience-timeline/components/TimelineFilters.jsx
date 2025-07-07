import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TimelineFilters = ({ 
  activeFilters, 
  onFilterChange, 
  layout, 
  onLayoutChange,
  totalExperiences,
  filteredCount 
}) => {
  const industryFilters = [
    { id: 'all', label: 'All Industries', icon: 'Globe', count: totalExperiences },
    { id: 'tech', label: 'Technology', icon: 'Code', count: 8 },
    { id: 'creative', label: 'Creative', icon: 'Palette', count: 5 },
    { id: 'freelance', label: 'Freelance', icon: 'Users', count: 3 }
  ];

  const roleFilters = [
    { id: 'all', label: 'All Roles', icon: 'Briefcase', count: totalExperiences },
    { id: 'development', label: 'Development', icon: 'Code2', count: 6 },
    { id: 'data-science', label: 'Data Science', icon: 'BarChart3', count: 4 },
    { id: 'cinematography', label: 'Cinematography', icon: 'Video', count: 3 },
    { id: 'design', label: 'Design', icon: 'Palette', count: 3 }
  ];

  const handleFilterClick = (filterType, filterId) => {
    onFilterChange(filterType, filterId);
  };

  const clearAllFilters = () => {
    onFilterChange('industry', 'all');
    onFilterChange('role', 'all');
  };

  const hasActiveFilters = activeFilters.industry !== 'all' || activeFilters.role !== 'all';

  return (
    <div className="bg-surface border border-border rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-text-primary font-semibold text-lg mb-1">
            Filter Experience
          </h2>
          <p className="text-text-secondary text-sm">
            Showing {filteredCount} of {totalExperiences} experiences
          </p>
        </div>

        {/* Layout Toggle & Clear Filters */}
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              iconName="X"
              iconPosition="left"
              className="text-text-secondary hover:text-text-primary"
            >
              Clear Filters
            </Button>
          )}
          
          <div className="flex items-center space-x-1 bg-background border border-border rounded-lg p-1">
            <button
              onClick={() => onLayoutChange('vertical')}
              className={`p-2 rounded transition-colors ${
                layout === 'vertical' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
              aria-label="Vertical timeline layout"
            >
              <Icon name="AlignLeft" size={16} />
            </button>
            <button
              onClick={() => onLayoutChange('horizontal')}
              className={`p-2 rounded transition-colors ${
                layout === 'horizontal' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
              aria-label="Horizontal timeline layout"
            >
              <Icon name="AlignCenter" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Filters */}
        <div>
          <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center">
            <Icon name="Building2" size={16} className="text-primary mr-2" />
            Filter by Industry
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {industryFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick('industry', filter.id)}
                className={`p-3 rounded-lg border text-left nav-transition ${
                  activeFilters.industry === filter.id
                    ? 'bg-primary/10 border-primary/30 text-primary' :'bg-background border-border text-text-secondary hover:text-text-primary hover:border-primary/20'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name={filter.icon} size={14} />
                  <span className="font-medium text-sm">{filter.label}</span>
                </div>
                <span className="text-xs opacity-75">{filter.count} positions</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role Type Filters */}
        <div>
          <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center">
            <Icon name="UserCheck" size={16} className="text-accent mr-2" />
            Filter by Role Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {roleFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick('role', filter.id)}
                className={`p-3 rounded-lg border text-left nav-transition ${
                  activeFilters.role === filter.id
                    ? 'bg-accent/10 border-accent/30 text-accent' :'bg-background border-border text-text-secondary hover:text-text-primary hover:border-accent/20'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name={filter.icon} size={14} />
                  <span className="font-medium text-sm">{filter.label}</span>
                </div>
                <span className="text-xs opacity-75">{filter.count} roles</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-secondary text-sm font-medium">Active filters:</span>
            {activeFilters.industry !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {industryFilters.find(f => f.id === activeFilters.industry)?.label}
                <button
                  onClick={() => handleFilterClick('industry', 'all')}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
            {activeFilters.role !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                {roleFilters.find(f => f.id === activeFilters.role)?.label}
                <button
                  onClick={() => handleFilterClick('role', 'all')}
                  className="ml-1 hover:text-accent/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineFilters;