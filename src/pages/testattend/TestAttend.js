import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './TestAttend.module.css';

const TestAttend = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com/';

    useEffect(() => {
        if (!state?.test) {
            navigate('/dashboard');
            return;
        }

        setTest(state.test);
        fetchQuestions(state.test.mcqCount);
        startTimer();
    }, [state, navigate]);

    const fetchQuestions = async (count) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/questions/all-questions`);
            const data = await response.json();

            // Shuffle and slice questions based on test.mcqCount
            const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, count);

            const formatted = shuffled.map((q, index) => ({
                id: index + 1,
                question: q.question?.value || 'No question text',
                options: [
                    q['1']?.value || '',
                    q['2']?.value || '',
                    q['3']?.value || '',
                    q['4']?.value || ''
                ],
                correctAnswer: parseInt(q.answer) - 1 // Convert '1' to 0-indexed
            }));

            setQuestions(formatted);
        } catch (err) {
            console.error(err);
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitTest = () => {
        const score = questions.reduce((total, question) => {
            return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
        }, 0);

        alert(`Test submitted! Your score: ${score}/${questions.length}`);
        navigate('/dashboard');
    };

    if (loading || !test) {
        return <div className={styles.container}>Loading test...</div>;
    }

    if (error) {
        return <div className={styles.container}>Error: {error}</div>;
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.testHeader}>
                <h2>{test.testName}</h2>
                <div className={styles.testInfo}>
                    <span>Subject: {test.subject}</span>
                    <span>Time Remaining: {formatTime(timeLeft)}</span>
                </div>
            </div>

            {questions.length > 0 && (
                <div className={styles.questionContainer}>
                    <div className={styles.questionNav}>
                        <button onClick={handlePrevQuestion} disabled={currentQuestion === 0}>
                            Previous
                        </button>
                        <span>Question {currentQuestion + 1} of {questions.length}</span>
                        <button onClick={handleNextQuestion} disabled={currentQuestion === questions.length - 1}>
                            Next
                        </button>
                    </div>

                    <div className={styles.questionCard}>
                        <h3>{questions[currentQuestion].question}</h3>
                        <div className={styles.options}>
                            {questions[currentQuestion].options.map((option, index) => (
                                <div key={index} className={styles.option}>
                                    <input
                                        type="radio"
                                        id={`option-${index}`}
                                        name={`question-${questions[currentQuestion].id}`}
                                        checked={answers[questions[currentQuestion].id] === index}
                                        onChange={() => handleAnswerSelect(questions[currentQuestion].id, index)}
                                    />
                                    <label htmlFor={`option-${index}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.submitSection}>
                        <button onClick={handleSubmitTest} className={styles.submitButton}>
                            Submit Test
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestAttend;
