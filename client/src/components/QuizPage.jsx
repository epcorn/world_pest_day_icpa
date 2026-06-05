import React, { useEffect, useState } from 'react';
import quiz from "../data/quizQuestion.json";
import axios from 'axios';

function QuizPage({ userVideo, onSubmissionSuccess }) {
  const [currQuestion, setCurrQuestion] = useState(0);
  const [count, setCount] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });

  // Set initial random question
  useEffect(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * quiz.questions.length);
    } while (rand === 24 || rand === 23 || rand === 21);
    setCurrQuestion(rand);
  }, []);

  // Submit to API automatically when the quiz ends and score qualifies
  useEffect(() => {
    const submitQuizResult = async () => {
      // FIX: Ensure we match userVideo._id accurately and don't re-trigger while loading/successful
      if (count === 3 && score >= 2 && userVideo?._id && !submitStatus.success && !submitStatus.loading) {

        setSubmitStatus(prev => ({ ...prev, loading: true, error: null }));

        try {
          console.log("Submitting quiz score for user:", userVideo._id);
          const res = await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/approve/${userVideo._id}?score=${score}`
          );
          console.log("Approval response:", res.data);

          setSubmitStatus({ loading: false, error: null, success: true });

          if (onSubmissionSuccess) {
            onSubmissionSuccess();
          }
        } catch (error) {
          console.error("Error getting approval:", error);
          setSubmitStatus({ loading: false, error: "Failed to submit approval request.", success: false });
        }
      }
    };

    submitQuizResult();
    // FIX: Removed submitStatus states from dependencies to completely break the infinite update loop
  }, [count, score, userVideo?._id, onSubmissionSuccess]);

  const handleClick = (chosenOption, correctOption) => {
    if (loading) return;

    setLoading(true);
    setSelectedOption(chosenOption);

    if (chosenOption === correctOption) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setCount(prev => prev + 1);
      setCurrQuestion(prev => (prev >= quiz.questions.length - 1 ? 0 : prev + 1));
      setLoading(false);
      setSelectedOption(null);
    }, 2500);
  };

  const handleRestart = () => {
    setCount(0);
    setScore(0);
    setSelectedOption(null);
    setSubmitStatus({ loading: false, error: null, success: false });

    let rand;
    do {
      rand = Math.floor(Math.random() * quiz.questions.length);
    } while (rand === 24 || rand === 23 || rand === 21);
    setCurrQuestion(rand);
  };

  if (count >= 3) {
    return (
      <article className="p-4 text-center max-w-xl mx-auto">
        <h2 className="text-xl font-bold">Quiz Completed! 🎉</h2>
        <p className="mt-2 text-gray-600">You answered {score}/3 questions correctly.</p>

        {score >= 2 && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
            {submitStatus.loading && <p className="text-blue-500 animate-pulse">Submitting approval status...</p>}
            {submitStatus.success && <a href={userVideo.quizCertificateUrl} className="text-green-600 font-medium">Approved and find Certificate on Email or Click to Download 🚀</a>}
            {submitStatus.error && <p className="text-red-500">{submitStatus.error}</p>}
          </div>
        )}

        {(score < 2 || submitStatus.error) && (
          <button
            onClick={handleRestart}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Restart Quiz
          </button>
        )}
      </article>
    );
  }

  const currentQuestionData = quiz?.questions?.[currQuestion];
  if (!currentQuestionData) return <p className="text-center p-4">Loading initial question...</p>;

  return (
    <article className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold">{quiz.quizTitle} ({count + 1}/3)</h2>

      <div className='mt-2'>
        <p className='my-1'><strong>Question:</strong> {currentQuestionData.question}</p>
        <div className='grid grid-cols-2 gap-2 p-2'>
          {currentQuestionData.options.map((o, i) => {
            let buttonClass = "bg-gray-200 hover:shadow-inner";
            if (loading) {
              if (o === currentQuestionData.answer) {
                buttonClass = "bg-green-400 text-white";
              } else if (o === selectedOption) {
                buttonClass = "bg-red-400 text-white";
              } else {
                buttonClass = "bg-gray-100 opacity-50";
              }
            }

            return (
              <button
                key={i}
                style={{ "--num": `"${i + 1}: "` }}
                disabled={loading}
                className={`${buttonClass} py-3 text-left px-5 rounded-xl shadow-md shadow-black/20 before:content-[var(--num)] transition-all ${loading ? 'cursor-not-allowed' : ''}`}
                onClick={() => handleClick(o, currentQuestionData.answer)}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default QuizPage;