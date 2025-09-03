import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../services/api';
import { TrendingUp } from 'lucide-react';

interface Skill {
  skill: string;
  current: number;
  target: number;
  improvement: number;
}

const SkillProgress: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkillProgress = async () => {
      try {
        const skillData = await analyticsAPI.getSkillProgress();
        setSkills(skillData);
      } catch (error) {
        console.error('Failed to load skill progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkillProgress();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Skill Progress</h3>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => {
          const progress = (skill.current / skill.target) * 100;
          const isCompleted = skill.current >= skill.target;
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                <span className="text-xs text-gray-500">
                  {skill.current}% / {skill.target}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">
        View Skill Analysis
      </button>
    </div>
  );
};

export default SkillProgress;