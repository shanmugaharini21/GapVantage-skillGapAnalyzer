import { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, BookOpen, Brain, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProgressStats {
  totalSkills: number;
  averageProficiency: number;
  completedAssessments: number;
  inProgressResources: number;
  completedResources: number;
  totalLearningHours: number;
}

interface RecentActivity {
  type: string;
  title: string;
  date: string;
  score?: number;
}

export function ProgressDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    totalSkills: 0,
    averageProficiency: 0,
    completedAssessments: 0,
    inProgressResources: 0,
    completedResources: 0,
    totalLearningHours: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    try {
      const [
        { data: userSkills },
        { data: completedAssessments },
        { data: learningProgress },
      ] = await Promise.all([
        supabase
          .from('user_skills')
          .select('*, skills(category)')
          .eq('user_id', user?.id),
        supabase
          .from('user_assessments')
          .select('*, assessments(title)')
          .eq('user_id', user?.id),
        supabase
          .from('user_learning_progress')
          .select('*, learning_resources(title, duration_hours)')
          .eq('user_id', user?.id),
      ]);

      const avgProficiency =
        userSkills && userSkills.length > 0
          ? userSkills.reduce((sum, s) => sum + s.proficiency_level, 0) / userSkills.length
          : 0;

      const inProgress = learningProgress?.filter((p) => p.status === 'in_progress').length || 0;
      const completed = learningProgress?.filter((p) => p.status === 'completed').length || 0;

      const categoryCount: Record<string, number> = {};
      userSkills?.forEach((skill) => {
        const category = skill.skills?.category || 'Other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      setStats({
        totalSkills: userSkills?.length || 0,
        averageProficiency: Math.round(avgProficiency),
        completedAssessments: completedAssessments?.length || 0,
        inProgressResources: inProgress,
        completedResources: completed,
        totalLearningHours:
          learningProgress?.reduce(
            (sum, p) => sum + (p.learning_resources?.duration_hours || 0),
            0
          ) || 0,
      });

      setSkillsByCategory(categoryCount);

      const activities: RecentActivity[] = [];

      completedAssessments?.slice(0, 3).forEach((assessment) => {
        activities.push({
          type: 'assessment',
          title: assessment.assessments?.title || 'Assessment',
          date: assessment.completed_at,
          score: Math.round((assessment.score / assessment.total_points) * 100),
        });
      });

      learningProgress?.slice(0, 3).forEach((progress) => {
        activities.push({
          type: progress.status,
          title: progress.learning_resources?.title || 'Learning Resource',
          date: progress.started_at,
        });
      });

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
  }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 font-medium">{title}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h2>
        <p className="text-gray-600">
          Track your learning journey and skill development over time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Brain}
          title="Skills Analyzed"
          value={stats.totalSkills}
          color="bg-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Average Proficiency"
          value={`${stats.averageProficiency}%`}
          color="bg-green-600"
        />
        <StatCard
          icon={Target}
          title="Assessments Completed"
          value={stats.completedAssessments}
          color="bg-orange-600"
        />
        <StatCard
          icon={BookOpen}
          title="Active Learning"
          value={stats.inProgressResources}
          subtitle={`${stats.completedResources} completed`}
          color="bg-red-600"
        />
        <StatCard
          icon={Award}
          title="Learning Hours"
          value={stats.totalLearningHours}
          subtitle="From started resources"
          color="bg-indigo-600"
        />
        <StatCard
          icon={Calendar}
          title="Recent Activity"
          value={recentActivity.length}
          subtitle="Last 30 days"
          color="bg-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Skills by Category</h3>
          {Object.entries(skillsByCategory).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, count]) => {
                const percentage = (count / stats.totalSkills) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-gray-600">
                        {count} skills ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          category === 'AI' ? 'bg-blue-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No skills analyzed yet</p>
              <p className="text-sm">Upload your resume to get started</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === 'assessment'
                        ? 'bg-orange-100'
                        : activity.type === 'completed'
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {activity.type === 'assessment' ? (
                      <Target className="w-4 h-4 text-orange-600" />
                    ) : activity.type === 'completed' ? (
                      <Award className="w-4 h-4 text-green-600" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {activity.type === 'assessment'
                            ? 'Completed assessment'
                            : activity.type === 'completed'
                            ? 'Completed resource'
                            : 'Started learning'}
                        </p>
                      </div>
                      {activity.score !== undefined && (
                        <span className="text-sm font-bold text-gray-900">
                          {activity.score}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No recent activity</p>
              <p className="text-sm">Start learning to see your progress here</p>
            </div>
          )}
        </div>
      </div>

      {stats.totalSkills > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Keep Up the Great Work!</h3>
              <p className="text-blue-100 mb-4">
                You're on track to becoming an AI & NLP expert. Continue taking assessments and
                exploring new learning resources to expand your skills.
              </p>
              <div className="flex items-center space-x-6">
                <div>
                  <div className="text-3xl font-bold">{stats.totalSkills}</div>
                  <div className="text-sm text-blue-100">Skills Tracked</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.completedAssessments}</div>
                  <div className="text-sm text-blue-100">Assessments Passed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.averageProficiency}%</div>
                  <div className="text-sm text-blue-100">Avg. Proficiency</div>
                </div>
              </div>
            </div>
            <Award className="w-24 h-24 text-white opacity-50" />
          </div>
        </div>
      )}
    </div>
  );
}
