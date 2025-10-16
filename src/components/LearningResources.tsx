import { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Clock, DollarSign, Star, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  url: string;
  provider: string;
  difficulty_level: string;
  duration_hours: number | null;
  rating: number | null;
  is_free: boolean;
  skill_id: string;
  skills?: {
    name: string;
    category: string;
  };
}

interface UserProgress {
  id: string;
  resource_id: string;
  status: string;
  progress_percentage: number;
}

export function LearningResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
    loadUserProgress();
  }, [user]);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*, skills(name, category)')
        .order('rating', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const progressMap: Record<string, UserProgress> = {};
      data?.forEach((item) => {
        progressMap[item.resource_id] = item;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const startResource = async (resourceId: string) => {
    try {
      const { error } = await supabase.from('user_learning_progress').upsert(
        {
          user_id: user?.id,
          resource_id: resourceId,
          status: 'in_progress',
          progress_percentage: 0,
        },
        { onConflict: 'user_id,resource_id' }
      );

      if (error) throw error;
      await loadUserProgress();
    } catch (error) {
      console.error('Error starting resource:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    return <BookOpen className="w-5 h-5" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-700';
      case 'tutorial':
        return 'bg-green-100 text-green-700';
      case 'certification':
        return 'bg-orange-100 text-orange-700';
      case 'book':
        return 'bg-red-100 text-red-700';
      case 'article':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600';
      case 'intermediate':
        return 'text-yellow-600';
      case 'advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredResources = resources.filter((resource) => {
    if (selectedCategory !== 'all' && resource.skills?.category !== selectedCategory) {
      return false;
    }
    if (selectedType !== 'all' && resource.resource_type !== selectedType) {
      return false;
    }
    if (selectedDifficulty !== 'all' && resource.difficulty_level !== selectedDifficulty) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Resources</h2>
        <p className="text-gray-600">
          Curated courses, tutorials, and certifications to help you master AI and NLP
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="AI">AI</option>
              <option value="NLP">NLP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="tutorial">Tutorials</option>
              <option value="certification">Certifications</option>
              <option value="book">Books</option>
              <option value="article">Articles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredResources.map((resource) => {
          const progress = userProgress[resource.id];
          return (
            <div
              key={resource.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(resource.resource_type)}`}>
                      {getTypeIcon(resource.resource_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{resource.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(
                            resource.resource_type
                          )}`}
                        >
                          {resource.resource_type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{resource.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{resource.provider}</span>
                        </div>
                        {resource.duration_hours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{resource.duration_hours} hours</span>
                          </div>
                        )}
                        {resource.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{resource.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{resource.is_free ? 'Free' : 'Paid'}</span>
                        </div>
                        <div
                          className={`font-medium capitalize ${getDifficultyColor(
                            resource.difficulty_level
                          )}`}
                        >
                          {resource.difficulty_level}
                        </div>
                        {resource.skills && (
                          <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                            {resource.skills.name}
                          </div>
                        )}
                      </div>

                      {progress && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 capitalize">{progress.status}</span>
                            <span className="text-gray-900 font-medium">
                              {progress.progress_percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {!progress ? (
                    <button
                      onClick={() => startResource(resource.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Start Learning
                    </button>
                  ) : (
                    <button
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      Continue
                    </button>
                  )}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <span>View Resource</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No resources found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more learning resources
          </p>
        </div>
      )}
    </div>
  );
}
