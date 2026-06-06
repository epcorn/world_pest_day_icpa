import React, { useEffect, useState, useRef } from 'react';
import quiz from "../data/quizQuestion.json";
import axios from 'axios';

const TOTAL_QUESTIONS = 3;
const PASS_SCORE = 2;
const FEEDBACK_DELAY = 1500;

function getRandomStartIndex(exclude = []) {
  let rand;
  do {
    rand = Math.floor(Math.random() * quiz.questions.length);
  } while (exclude.includes(rand));
  return rand;
}

function QuizPage({ userVideo, onSubmissionSuccess }) {
  const [questionIndex, setQuestionIndex] = useState(() => getRandomStartIndex([21, 23, 24]));
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });
  const hasSubmitted = useRef(false);

  const score = answers.filter(Boolean).length;
  const count = answers.length;

  // Auto-submit when quiz ends and score qualifies
  useEffect(() => {
    if (!quizDone || score < PASS_SCORE || hasSubmitted.current) return;

    const submit = async () => {
      hasSubmitted.current = true;
      setSubmitStatus({ loading: true, error: null, success: false });
      try {
        const email = localStorage.getItem("userEmail");
        await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/quiz/${email}?score=${score}`
        );
        setSubmitStatus({ loading: false, error: null, success: true });
        if (onSubmissionSuccess) onSubmissionSuccess();
      } catch (err) {
        hasSubmitted.current = false;
        setSubmitStatus({ loading: false, error: "Failed to submit. Please try again.", success: false });
      }
    };

    submit();
  }, [quizDone]);

  const handleOptionClick = (chosen) => {
    if (isRevealing) return;

    const correct = currentQuestion.answer;
    const isCorrect = chosen === correct;

    setSelectedOption(chosen);
    setIsRevealing(true);

    setTimeout(() => {
      const newAnswers = [...answers, isCorrect];
      setAnswers(newAnswers);

      if (newAnswers.length >= TOTAL_QUESTIONS) {
        setQuizDone(true);
      } else {
        setQuestionIndex(prev => (prev + 1) % quiz.questions.length);
      }

      setSelectedOption(null);
      setIsRevealing(false);
    }, FEEDBACK_DELAY);
  };

  const handleRestart = () => {
    hasSubmitted.current = false;
    setAnswers([]);
    setSelectedOption(null);
    setIsRevealing(false);
    setQuizDone(false);
    setSubmitStatus({ loading: false, error: null, success: false });
    setQuestionIndex(getRandomStartIndex([21, 23, 24]));
  };

  const currentQuestion = quiz?.questions?.[questionIndex];

  if (!currentQuestion) {
    return <p className="text-center p-4 text-gray-500">Loading question...</p>;
  }

  // Results screen
  if (quizDone) {
    const passed = score >= PASS_SCORE;
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className={`rounded-2xl border p-6 text-center ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`text-5xl mb-3 ${passed ? 'text-green-500' : 'text-red-400'}`}>
            {passed ? '🎉' : '😔'}
          </div>
          <h2 className={`text-2xl font-bold mb-1 ${passed ? 'text-green-700' : 'text-red-700'}`}>
            {passed ? 'Well done!' : 'Not quite!'}
          </h2>
          <p className="text-gray-600 text-base mb-4">
            You scored <span className="font-semibold text-gray-800">{score}/{TOTAL_QUESTIONS}</span>
          </p>

          {/* Score dots */}
          <div className="flex justify-center gap-2 mb-5">
            {answers.map((correct, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${correct ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
                  }`}
              >
                {correct ? '✓' : '✗'}
              </div>
            ))}
          </div>

          {passed && (
            <div className="rounded-xl bg-white border border-green-200 p-4 mb-4">
              {submitStatus.loading && (
                <p className="text-blue-500 text-sm animate-pulse">Sending your certificate...</p>
              )}
              {submitStatus.success && (
                <p className="text-green-600 font-medium text-sm">
                  Certificate sent to your email! Check your inbox to verify and submit your entry.
                </p>
              )}
              {submitStatus.error && (
                <p className="text-red-500 text-sm">{submitStatus.error}</p>
              )}
            </div>
          )}

          {(!passed || submitStatus.error) && (
            <button
              onClick={handleRestart}
              className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}

          {!passed && (
            <p className="mt-3 text-sm text-gray-500">
              You need at least {PASS_SCORE}/{TOTAL_QUESTIONS} to pass.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">
            {quiz.quizTitle}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {count + 1} / {TOTAL_QUESTIONS}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(count / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4">
        <p className="text-base font-medium text-gray-800 leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentQuestion.options.map((option, i) => {
          const isCorrect = option === currentQuestion.answer;
          const isSelected = option === selectedOption;

          let optionStyle = "bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50";
          if (isRevealing) {
            if (isCorrect) {
              optionStyle = "bg-green-500 border-green-500 text-white";
            } else if (isSelected) {
              optionStyle = "bg-red-400 border-red-400 text-white";
            } else {
              optionStyle = "bg-gray-100 border-gray-200 text-gray-400 opacity-60";
            }
          }

          return (
            <button
              key={i}
              disabled={isRevealing}
              onClick={() => handleOptionClick(option)}
              className={`${optionStyle} rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-start gap-3 ${isRevealing ? 'cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
                }`}
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5 ${isRevealing && isCorrect ? 'border-white text-white' :
                  isRevealing && isSelected ? 'border-white text-white' :
                    isRevealing ? 'border-gray-300 text-gray-400' :
                      'border-gray-300 text-gray-500'
                }`}>
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuizPage;