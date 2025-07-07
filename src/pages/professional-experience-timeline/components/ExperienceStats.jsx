import React from 'react';
import Icon from '../../../components/AppIcon';

const ExperienceStats = ({ experiences }) => {
  // Calculate statistics
  const totalYears = experiences.reduce((acc, exp) => {
    const years = parseFloat(exp.durationYears) || 0;
    return acc + years;
  }, 0);

  const totalProjects = experiences.reduce((acc, exp) => {
    return acc + (exp.projects?.length || 0);
  }, 0);

  const uniqueTechnologies = new Set();
  experiences.forEach(exp => {
    exp.technologies.forEach(tech => uniqueTechnologies.add(tech.name));
  });

  const industryCount = new Set(
    experiences.flatMap(exp => exp.industries)
  ).size;

  const stats = [
    {
      id: 'experience',
      label: 'Years Experience',
      value: Math.round(totalYears),
      suffix: '+',
      icon: 'Calendar',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      id: 'projects',
      label: 'Projects Completed',
      value: totalProjects,
      suffix: '+',
      icon: 'FolderCheck',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20'
    },
    {
      id: 'technologies',
      label: 'Technologies Mastered',
      value: uniqueTechnologies.size,
      suffix: '+',
      icon: 'Code',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20'
    },
    {
      id: 'industries',
      label: 'Industries Served',
      value: industryCount,
      suffix: '',
      icon: 'Building2',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`p-4 ${stat.bgColor} border ${stat.borderColor} rounded-xl hover-glow nav-transition`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={stat.icon} size={20} className={stat.color} />
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className={`text-lg font-semibold ${stat.color} opacity-75`}>
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-xs font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceStats;