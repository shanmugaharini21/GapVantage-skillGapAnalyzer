import { useState } from 'react';
import { Brain, Upload, Target, BookOpen, TrendingUp, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SkillAnalysis } from './SkillAnalysis';
import { Assessments } from './Assessments';
import { LearningResources } from './LearningResources';
import { ProgressDashboard } from './ProgressDashboard';

type TabType = 'analysis' | 'assessments' | 'resources' | 'progress';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { id: 'analysis' as TabType, label: 'Skill Analysis', icon: Upload },
    { id: 'assessments' as TabType, label: 'Assessments', icon: Target },
    { id: 'resources' as TabType, label: 'Learning Resources', icon: BookOpen },
    { id: 'progress' as TabType, label: 'Progress', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">GapVantage AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <nav className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          {activeTab === 'analysis' && <SkillAnalysis />}
          {activeTab === 'assessments' && <Assessments />}
          {activeTab === 'resources' && <LearningResources />}
          {activeTab === 'progress' && <ProgressDashboard />}
        </div>
      </div>
    </div>
  );
}
