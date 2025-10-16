import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
}

interface UserSkill {
  id: string;
  skill_id: string;
  proficiency_level: number;
  source: string;
  skills: Skill;
}

export function SkillAnalysis() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadUserSkills();
    }
  }, [user]);

  const loadUserSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*, skills(*)')
        .eq('user_id', user?.id)
        .order('proficiency_level', { ascending: false });

      if (error) throw error;
      setUserSkills(data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const simulateSkillExtraction = async () => {
    const { data: allSkills, error } = await supabase
      .from('skills')
      .select('*')
      .limit(10);

    if (error) throw error;

    const skillsToAdd = allSkills.slice(0, 6).map((skill) => ({
      user_id: user?.id,
      skill_id: skill.id,
      proficiency_level: Math.floor(Math.random() * 40) + 40,
      source: file ? 'resume' : 'linkedin',
    }));

    const { error: insertError } = await supabase
      .from('user_skills')
      .upsert(skillsToAdd, { onConflict: 'user_id,skill_id' });

    if (insertError) throw insertError;

    if (file) {
      const { error: uploadError } = await supabase
        .from('resume_uploads')
        .insert({
          user_id: user?.id,
          file_name: file.name,
          file_url: '#',
          parsed_data: { extracted_skills: skillsToAdd.length },
        });

      if (uploadError) throw uploadError;
    }
  };

  const handleAnalyze = async () => {
    if (!file && !linkedinUrl) {
      setMessage('Please upload a resume or enter a LinkedIn URL');
      return;
    }

    setAnalyzing(true);
    setMessage('');

    try {
      await simulateSkillExtraction();
      await loadUserSkills();
      setMessage('Analysis complete! Skills have been extracted and added to your profile.');
      setFile(null);
      setLinkedinUrl('');
    } catch (error) {
      console.error('Error analyzing:', error);
      setMessage('An error occurred during analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Proficient';
    if (level >= 40) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skill Analysis</h2>
        <p className="text-gray-600">
          Upload your resume or connect your LinkedIn profile to extract and analyze your AI and
          NLP skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
            <p className="text-sm text-gray-600 mb-4">
              PDF, DOC, or DOCX (Max 5MB)
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Choose File
              </span>
            </label>
            {file && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">LinkedIn Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your LinkedIn profile URL
            </p>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={analyzing || (!file && !linkedinUrl)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
        >
          {analyzing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Analyze Skills</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center space-x-2 p-4 rounded-lg ${
            message.includes('error')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {message.includes('error') ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {userSkills.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Your Skills Profile</h3>
          <div className="grid grid-cols-1 gap-4">
            {userSkills.map((userSkill) => (
              <div
                key={userSkill.id}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {userSkill.skills.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {userSkill.skills.category}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {userSkill.skills.difficulty_level}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {userSkill.proficiency_level}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {getProficiencyLabel(userSkill.proficiency_level)}
                    </div>
                  </div>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${getProficiencyColor(
                      userSkill.proficiency_level
                    )} transition-all duration-500`}
                    style={{ width: `${userSkill.proficiency_level}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3">{userSkill.skills.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
