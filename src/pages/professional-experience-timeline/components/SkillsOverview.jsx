import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SkillsOverview = ({ experiences }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Extract and categorize skills from experiences
  const extractSkills = () => {
    const skillsMap = new Map();
    
    experiences.forEach(exp => {
      exp.technologies.forEach(tech => {
        if (skillsMap.has(tech.name)) {
          const existing = skillsMap.get(tech.name);
          skillsMap.set(tech.name, {
            ...existing,
            level: Math.max(existing.level, tech.level),
            count: existing.count + 1
          });
        } else {
          skillsMap.set(tech.name, {
            name: tech.name,
            icon: tech.icon,
            level: tech.level,
            proficiency: tech.proficiency,
            category: tech.category || 'Other',
            count: 1
          });
        }
      });
    });

    return Array.from(skillsMap.values()).sort((a, b) => b.level - a.level || b.count - a.count);
  };

  const skills = extractSkills();
  
  const categories = [
    { id: 'all', label: 'All Skills', icon: 'Grid3X3' },
    { id: 'Frontend', label: 'Frontend', icon: 'Monitor' },
    { id: 'Backend', label: 'Backend', icon: 'Server' },
    { id: 'Database', label: 'Database', icon: 'Database' },
    { id: 'DevOps', label: 'DevOps', icon: 'Cloud' },
    { id: 'Data Science', label: 'Data Science', icon: 'BarChart3' },
    { id: 'Design', label: 'Design', icon: 'Palette' },
    { id: 'Other', label: 'Other', icon: 'Settings' }
  ];

  const filteredSkills = activeCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === activeCategory);

  const getProficiencyColor = (level) => {
    if (level >= 4) return 'text-success';
    if (level >= 3) return 'text-primary';
    if (level >= 2) return 'text-warning';
    return 'text-text-secondary';
  };

  const getProficiencyBg = (level) => {
    if (level >= 4) return 'bg-success/10 border-success/20';
    if (level >= 3) return 'bg-primary/10 border-primary/20';
    if (level >= 2) return 'bg-warning/10 border-warning/20';
    return 'bg-surface border-border';
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-text-primary font-semibold text-lg mb-1">
            Skills Overview
          </h2>
          <p className="text-text-secondary text-sm">
            Technologies and tools used across {experiences.length} professional experiences
          </p>
        </div>
        <div className="text-text-secondary text-sm">
          {filteredSkills.length} skills
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium nav-transition ${
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-text-secondary hover:text-text-primary hover:bg-surface border border-border'
            }`}
          >
            <Icon name={category.icon} size={14} />
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.name}
            className={`p-4 rounded-lg border nav-transition hover-glow ${getProficiencyBg(skill.level)}`}
          >
            {/* Skill Header */}
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center`}>
                <Icon name={skill.icon} size={16} className={getProficiencyColor(skill.level)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary font-medium text-sm truncate">
                  {skill.name}
                </h3>
                <p className={`text-xs ${getProficiencyColor(skill.level)}`}>
                  {skill.proficiency}
                </p>
              </div>
            </div>

            {/* Proficiency Level */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-secondary text-xs">Proficiency</span>
                <span className={`text-xs font-medium ${getProficiencyColor(skill.level)}`}>
                  {skill.level}/5
                </span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < skill.level 
                        ? getProficiencyColor(skill.level).replace('text-', 'bg-')
                        : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Usage Count */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Used in</span>
              <span className="text-text-primary font-medium">
                {skill.count} {skill.count === 1 ? 'role' : 'roles'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-text-primary font-medium text-lg mb-2">
            No skills found
          </h3>
          <p className="text-text-secondary text-sm">
            Try selecting a different category to view skills.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillsOverview;