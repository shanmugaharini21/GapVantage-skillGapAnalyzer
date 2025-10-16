import { useState } from 'react';
import { Brain, Target, BookOpen, TrendingUp, Upload, Award, ArrowRight } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">GapVantage AI</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <button
              onClick={handleSignIn}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Your AI & NLP Skill Gaps,
            <br />
            <span className="text-blue-600">Unlock Your Potential</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Leverage advanced AI technology to analyze your skills, take interactive assessments,
            and receive personalized learning paths tailored to your career goals in artificial
            intelligence and natural language processing.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-lg flex items-center space-x-2"
            >
              <span>Start Free Analysis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#how-it-works"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Resume Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload your resume or LinkedIn profile. Our AI extracts and analyzes your skills in
              seconds, identifying your strengths and areas for growth.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Assessments</h3>
            <p className="text-gray-600 leading-relaxed">
              Take NLP-powered quizzes that adapt to your level. Get real-time feedback and
              detailed insights into your AI and machine learning proficiency.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized Learning</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive curated course recommendations, tutorials, and certifications matched
              precisely to your skill gaps and learning style.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel in AI & NLP
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed for students, professionals, and recruiters to master
              the latest in artificial intelligence and natural language processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    AI-Powered Skill Extraction
                  </h3>
                  <p className="text-gray-600">
                    Advanced NLP algorithms automatically identify and categorize your technical
                    skills from resumes, portfolios, and profiles.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Progress Tracking</h3>
                  <p className="text-gray-600">
                    Visual dashboards showing your skill development over time with detailed
                    analytics and milestone achievements.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Certification Paths</h3>
                  <p className="text-gray-600">
                    Discover relevant certifications and structured learning paths from top
                    platforms like Coursera, Udemy, and Hugging Face.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Gap Analysis Reports</h3>
                  <p className="text-gray-600">
                    Comprehensive reports highlighting exactly where you stand and what you need to
                    learn to reach your career goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple, fast, and effective in three steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload & Analyze</h3>
              <p className="text-gray-600">
                Upload your resume or connect your LinkedIn profile. Our AI instantly extracts and
                analyzes your AI/NLP skills.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Take Assessments</h3>
              <p className="text-gray-600">
                Complete interactive quizzes tailored to your level. Get immediate feedback on your
                strengths and weaknesses.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Learn & Grow</h3>
              <p className="text-gray-600">
                Follow your personalized learning path with curated resources. Track your progress
                and celebrate achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Bridge Your Skill Gaps?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals advancing their AI and NLP careers with GapVantage AI
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="w-6 h-6 text-blue-500" />
              <span className="text-white font-bold text-lg">GapVantage AI</span>
            </div>
            <p className="text-sm">
              © 2024 GapVantage AI. Empowering the next generation of AI professionals.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}
