import { useState, useEffect } from 'react';
import { Target, Clock, Award, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
  order_number: number;
}

interface UserAssessment {
  id: string;
  score: number;
  total_points: number;
  completed_at: string;
  assessments: Assessment;
}

export function Assessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<UserAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
    loadCompletedAssessments();
  }, [user]);

  const loadAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_assessments')
        .select('*, assessments(*)')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletedAssessments(data || []);
    } catch (error) {
      console.error('Error loading completed assessments:', error);
    }
  };

  const startAssessment = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);

    const sampleQuestions: Question[] = [
      {
        id: '1',
        question_text: 'What is the primary purpose of the attention mechanism in Transformer models?',
        question_type: 'multiple_choice',
        options: [
          'To reduce computational complexity',
          'To allow the model to focus on relevant parts of the input',
          'To increase training speed',
          'To reduce model size',
        ],
        correct_answer: 'To allow the model to focus on relevant parts of the input',
        points: 10,
        order_number: 1,
      },
      {
        id: '2',
        question_text: 'Which of the following is NOT a common NLP preprocessing step?',
        question_type: 'multiple_choice',
        options: [
          'Tokenization',
          'Lemmatization',
          'Gradient descent',
          'Stop word removal',
        ],
        correct_answer: 'Gradient descent',
        points: 10,
        order_number: 2,
      },
      {
        id: '3',
        question_text: 'What does BERT stand for?',
        question_type: 'multiple_choice',
        options: [
          'Bidirectional Encoder Representations from Transformers',
          'Basic Encoding for Recurrent Transformers',
          'Binary Encoder for Real-time Transformations',
          'Balanced Embedding Representation Technique',
        ],
        correct_answer: 'Bidirectional Encoder Representations from Transformers',
        points: 10,
        order_number: 3,
      },
      {
        id: '4',
        question_text: 'In machine learning, what is overfitting?',
        question_type: 'multiple_choice',
        options: [
          'When the model performs poorly on both training and test data',
          'When the model performs well on training data but poorly on test data',
          'When the model takes too long to train',
          'When the model uses too few parameters',
        ],
        correct_answer: 'When the model performs well on training data but poorly on test data',
        points: 10,
        order_number: 4,
      },
      {
        id: '5',
        question_text: 'What is the purpose of word embeddings in NLP?',
        question_type: 'multiple_choice',
        options: [
          'To compress text data',
          'To represent words as dense vectors that capture semantic meaning',
          'To remove stop words from text',
          'To translate text between languages',
        ],
        correct_answer: 'To represent words as dense vectors that capture semantic meaning',
        points: 10,
        order_number: 5,
      },
    ];

    setQuestions(sampleQuestions);
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    let totalScore = 0;
    let totalPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;
      if (answers[question.id] === question.correct_answer) {
        totalScore += question.points;
      }
    });

    setScore(totalScore);
    setShowResults(true);

    try {
      const { error } = await supabase.from('user_assessments').insert({
        user_id: user?.id,
        assessment_id: selectedAssessment?.id,
        score: totalScore,
        total_points: totalPoints,
        time_taken_minutes: selectedAssessment?.duration_minutes,
      });

      if (error) throw error;
      await loadCompletedAssessments();
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (selectedAssessment && !showResults) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{selectedAssessment.title}</h2>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question_text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      answers[currentQuestion.id] === option
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[currentQuestion.id] === option && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setSelectedAssessment(null)}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Exit Assessment
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>{currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.reduce((sum, q) => sum + q.points, 0)) * 100;

    return (
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-white border border-gray-200 rounded-xl p-12">
          <div
            className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              percentage >= 70 ? 'bg-green-100' : 'bg-yellow-100'
            }`}
          >
            {percentage >= 70 ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <Award className="w-12 h-12 text-yellow-600" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-gray-600 mb-8">
            You've completed {selectedAssessment?.title}
          </p>

          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {score} / {questions.reduce((sum, q) => sum + q.points, 0)}
            </div>
            <div className="text-xl text-gray-600">
              {percentage.toFixed(0)}% Score
            </div>
          </div>

          <div className="space-y-4 text-left mb-8">
            {questions.map((question, index) => {
              const isCorrect = answers[question.id] === question.correct_answer;
              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        Question {index + 1}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{question.question_text}</p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Correct answer:</span>{' '}
                          {question.correct_answer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setSelectedAssessment(null);
              setShowResults(false);
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI & NLP Assessments</h2>
        <p className="text-gray-600">
          Test your knowledge and skills with our comprehensive assessments
        </p>
      </div>

      {completedAssessments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {completedAssessments.slice(0, 4).map((result) => (
              <div
                key={result.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {result.assessments.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(result.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((result.score / result.total_points) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {result.score}/{result.total_points}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Assessments</h3>
        <div className="grid grid-cols-1 gap-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{assessment.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        assessment.difficulty_level
                      )}`}
                    >
                      {assessment.difficulty_level}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{assessment.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{assessment.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{assessment.category}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startAssessment(assessment)}
                  className="ml-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Start</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
