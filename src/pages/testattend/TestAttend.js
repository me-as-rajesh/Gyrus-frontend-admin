import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './TestAttend.module.css';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const TestAttend = () => {
    const [showExplanation, setShowExplanation] = useState(false);
    const location = useLocation();
    const studentName = location.state?.studentName || '';
    const studentEmail = location.state?.studentEmail || '';
    const studentGender = location.state?.studentGender || '';
    const studentDob = location.state?.studentDob || '';
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:5000';

    // IMAGE SIZE used for image rendering similar to Table.js
    const IMAGE_SIZE = 120;

    // ================================
    // Helpers for tolerant parsing (ported from Table.js)
    // ================================
    const normalizeToken = (s) => {
        if (s == null) return '';
        let t = String(s);
        t = t.replace(/""/g, '"').trim();
        t = t.replace(/^,/, '').replace(/,+$/, '').trim();
        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
            t = t.slice(1, -1);
        }
        t = t.replace(/^"+/, '').replace(/"+$/, '').trim();
        return t;
    };

    const splitTopLevelCSV = (s) => {
        if (!s) return [];
        const out = [];
        let buf = '';
        let inStr = false;
        let esc = false;

        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (inStr) {
                if (esc) {
                    esc = false;
                    buf += ch;
                } else if (ch === '\\') {
                    esc = true;
                    buf += ch;
                } else if (ch === '"') {
                    inStr = false;
                    buf += ch;
                } else {
                    buf += ch;
                }
                continue;
            }
            if (ch === '"') {
                inStr = true;
                buf += ch;
            } else if (ch === ',') {
                out.push(buf);
                buf = '';
            } else {
                buf += ch;
            }
        }
        if (buf.length) out.push(buf);
        return out.map(normalizeToken);
    };

    const extractBracketedAfterKey = (src, key) => {
        const keyIdx = src.indexOf(key);
        if (keyIdx === -1) return null;
        let i = src.indexOf('[', keyIdx);
        if (i === -1) return null;
        let depth = 0;
        let inStr = false;
        let esc = false;
        let start = -1;

        for (; i < src.length; i++) {
            const ch = src[i];
            if (inStr) {
                if (esc) esc = false;
                else if (ch === '\\') esc = true;
                else if (ch === '"') inStr = false;
                continue;
            }
            if (ch === '"') {
                inStr = true;
                continue;
            }
            if (ch === '[') {
                if (depth === 0) start = i + 1;
                depth++;
            } else if (ch === ']') {
                depth--;
                if (depth === 0) return src.slice(start, i);
            }
        }
        return null;
    };

    const ensureTagged = (cell) => {
        let v = normalizeToken(cell);
        if (!v) return 'txt#*#';
        if (v.includes('#*#')) return v;
        if (/[\\^{}_]/.test(v)) {
            // Don't modify backslashes here - let LaTeX handle them
            return `eq#*#${v}`;
        }
        if (/\.(jpg|jpeg|png|gif)$/i.test(v)) {
            return `img#*#${v}`;
        }
        return `txt#*#${v}`;
    };

    // ================================
    // Render tagged cells (eq/img/txt)
    // ================================
    const renderTaggedCell = (raw) => {
        if (raw == null) return 'N/A';
        let val = normalizeToken(raw);
        const parts = val.split('#*#');

        if (parts.length < 2) {
            if (/[\\^{}_]/.test(val)) {
                try {
                    return <InlineMath math={val} />;
                } catch {
                    return `[Invalid LaTeX: ${val}]`;
                }
            }
            if (/\.(jpg|jpeg|png|gif)$/i.test(val)) {
                return (
                    <img
                        src={val}
                        alt="img"
                        width={IMAGE_SIZE}
                        height={IMAGE_SIZE}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                );
            }
            return val;
        }

        const tag = parts[0];
        let payload = parts.slice(1).join('#*#').trim();

        if (tag === 'eq') {
            try {
                return <InlineMath math={payload} />;
            } catch {
                return `[Invalid LaTeX: ${payload}]`;
            }
        }
        if (tag === 'img') {
            return (
                <img
                    src={payload}
                    alt="img"
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                />
            );
        }
        if (tag === 'txt') {
            const lines = payload.split('\n');
            return (
                <span>
                    {lines.map((line, idx) => (
                        <span key={`line-${idx}`}>
                            {line}
                            {idx < lines.length - 1 && <br />}
                        </span>
                    ))}
                </span>
            );
        }
        return val;
    };

    // ================================
    // Table parser (tolerant with repairs for LaTeX tables)
    // ================================
    const parseTableBlock = (block) => {
        try {
            let src = String(block).trim().replace(/^(table|tabl)#\*#/, '').trim();
            src = src.replace(/""/g, '"');
            let headers = ['txt#*#', 'txt#*#List - I', 'txt#*#', 'txt#*#List - II'];
            let rows = [];
            try {
                const obj = JSON.parse(src);
                if (obj.th && obj.tr && Array.isArray(obj.th) && Array.isArray(obj.tr)) {
                    headers = obj.th.map(ensureTagged);
                    rows = obj.tr
                        .map((row) => (Array.isArray(row) ? row.map(ensureTagged) : []))
                        .filter((row) => row.length > 0);
                } else if (obj.th) {
                    headers = obj.th.map(ensureTagged);
                }
            } catch (jsonErr) {
                const headerBody = extractBracketedAfterKey(src, '"th"') || '';
                const rowsBody = extractBracketedAfterKey(src, '"tr"') || '';
                if (headerBody) {
                    headers = splitTopLevelCSV(headerBody).map(ensureTagged);
                }
                if (headers.length < 4) {
                    headers = ['txt#*#', 'txt#*#List - I', 'txt#*#', 'txt#*#List - II'];
                }
                if (rowsBody) {
                    const rowStrings = rowsBody
                        .split('],[')
                        .map((s) => s.replace(/^\[|\]$/g, '').trim());
                    rows = rowStrings.map((rowStr) => {
                        let cells = splitTopLevelCSV(rowStr);
                        while (cells.length < 4) cells.push('txt#*#');
                        cells = cells.slice(0, 4).map(ensureTagged);
                        return cells;
                    });
                }
                if (rows.length === 0 && src.includes('(A)') && src.includes('(D)')) {
                    const rowData = src
                        .split(/[[\]]/)
                        .filter(
                            (s) =>
                                s.includes('(A)') ||
                                s.includes('(B)') ||
                                s.includes('(C)') ||
                                s.includes('(D)')
                        );
                    rows = rowData.map((rowStr) => {
                        let cells = splitTopLevelCSV(rowStr);
                        while (cells.length < 4) cells.push('txt#*#');
                        cells = cells.slice(0, 4).map(ensureTagged);
                        return cells;
                    });
                }
            }
            if (rows.length === 0) {
                rows.push(new Array(headers.length).fill('txt#*#'));
            }
            return { headers, rows };
        } catch (e) {
            console.error('Table parse error:', e);
            return {
                headers: ['txt#*#Column'],
                rows: [[`txt#*#${String(block)}`]],
            };
        }
    };

    // ================================
    // Render text (with table support)
    // ================================
    const renderTextWithLatex = (text) => {
        if (!text || typeof text !== 'string') {
            console.warn('Invalid text for rendering:', text);
            return <div className="content-wrapper">N/A</div>;
        }

        try {
            let src = text.replace(/^(txt#\*#|eq#\*#|img#\*#)/, '');
            const sections = src.split('#@#');
            const parts = [];

            sections.forEach((sec, secIdx) => {
                if (!sec) return;
                sec = normalizeToken(sec);

                // TABLE BLOCK
                if (sec.match(/^(table|tabl)#\*#/)) {
                    const parsed = parseTableBlock(sec);
                    parts.push(
                        <div key={`table-${secIdx}`} className="part-wrapper">
                            <table className="nested-table">
                                <thead>
                                    <tr>
                                        {parsed.headers.map((h, i) => (
                                            <th key={`th-${i}`}>{renderTaggedCell(h)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsed.rows.map((row, rIdx) => (
                                        <tr key={`tr-${rIdx}`}>
                                            {row.map((cell, cIdx) => (
                                                <td key={`td-${rIdx}-${cIdx}`}>{renderTaggedCell(cell)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                    return;
                }

                // NON-TABLE CONTENT
                const tagRegex = /(eq#\*#|img#\*#|txt#\*#)([\s\S]*?)(?=(eq#\*#|img#\*#|txt#\*#|$))/g;
                let lastIndex = 0;
                const sectionParts = [];

                let match;
                while ((match = tagRegex.exec(sec)) !== null) {
                    const startIndex = match.index;
                    const tag = match[1];
                    const content = normalizeToken(match[2] || '');

                    if (startIndex > lastIndex) {
                        const plain = normalizeToken(sec.slice(lastIndex, startIndex));
                        if (plain) {
                            const lines = plain.split('\n');
                            lines.forEach((line, idx) => {
                                sectionParts.push(
                                    <span key={`plain-${secIdx}-${idx}`}>
                                        {line}
                                        {idx < lines.length - 1 && <br />}
                                    </span>
                                );
                            });
                        }
                    }

                    if (tag === 'eq#*#') {
                        try {
                            sectionParts.push(
                                <InlineMath key={`eq-${secIdx}-${sectionParts.length}`} math={content} />
                            );
                        } catch {
                            sectionParts.push(
                                <span key={`eqerr-${secIdx}-${sectionParts.length}`}>
                                    [Invalid LaTeX: {content}]
                                </span>
                            );
                        }
                    } else if (tag === 'img#*#') {
                        sectionParts.push(
                            <img
                                key={`img-${secIdx}-${sectionParts.length}`}
                                src={content}
                                alt="content"
                                className="table-image"
                            />
                        );
                    } else if (tag === 'txt#*#') {
                        const lines = content.split('\n');
                        sectionParts.push(
                            <span key={`txt-${secIdx}-${sectionParts.length}`}>
                                {lines.map((line, idx) => (
                                    <span key={`line-${idx}`}>
                                        {line}
                                        {idx < lines.length - 1 && <br />}
                                    </span>
                                ))}
                            </span>
                        );
                    }

                    lastIndex = tagRegex.lastIndex;
                }

                if (lastIndex < sec.length) {
                    const tail = normalizeToken(sec.slice(lastIndex));
                    if (tail) {
                        if (/[\\^{}_]/.test(tail)) {
                            try {
                                sectionParts.push(
                                    <InlineMath key={`eq-${secIdx}-${sectionParts.length}`} math={tail} />
                                );
                            } catch {
                                const lines = tail.split('\n');
                                sectionParts.push(
                                    <span key={`tail-${secIdx}-${sectionParts.length}`}>
                                        {lines.map((line, idx) => (
                                            <span key={`line-${idx}`}>
                                                {line}
                                                {idx < lines.length - 1 && <br />}
                                            </span>
                                        ))}
                                    </span>
                                );
                            }
                        } else if (/\.(jpg|jpeg|png|gif)$/i.test(tail)) {
                            sectionParts.push(
                                <img
                                    key={`img-${secIdx}-${sectionParts.length}`}
                                    src={tail}
                                    alt="content"
                                    className="table-image"
                                />
                            );
                        } else {
                            const lines = tail.split('\n');
                            sectionParts.push(
                                <span key={`tail-${secIdx}-${sectionParts.length}`}>
                                    {lines.map((line, idx) => (
                                        <span key={`line-${idx}`}>
                                            {line}
                                            {idx < lines.length - 1 && <br />}
                                        </span>
                                    ))}
                                </span>
                            );
                        }
                    }
                }

                if (sectionParts.length > 0) {
                    parts.push(
                        <div key={`section-${secIdx}`} className="section-wrapper">
                            {sectionParts}
                        </div>
                    );
                }
            });

            return <div className="content-wrapper">{parts}</div>;
        } catch (err) {
            console.warn('Rendering error:', err);
            return <div className="content-wrapper">[Rendering Error]</div>;
        }
    };

    // Refs to keep latest answers and questions inside timer without re-creating interval
    const answersRef = useRef(answers);
    const questionsRef = useRef(questions);

    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { questionsRef.current = questions; }, [questions]);

    useEffect(() => {
        // Get params from location.state
        const params = location.state?.params;
        const testObj = location.state?.test;
        if (!testObj || !params) {
            navigate('/dashboard');
            return;
        }
        setTest(testObj);
        // Use testObj.standard if available, else params.standard
        const standard = testObj.standard || params.standard;
        fetchQuestions(params.subject, params.count, standard);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Auto-submit using latest refs
                    const score = questionsRef.current.reduce((total, question) => {
                        return total + ((answersRef.current[question.id] === question.correctAnswer) ? 1 : 0);
                    }, 0);
                    alert(`Test submitted! Your score: ${score}/${questionsRef.current.length}`);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [location.state, navigate]);
    const fetchQuestions = async (subject, count, standard) => {
        // Always convert standard "11"/"12" to "XI"/"XII" for API
        let apiStandard = standard;
        if (standard === "11") apiStandard = "XI";
        else if (standard === "12") apiStandard = "XII";
        try {
            const response = await fetch(`${API_BASE_URL}/api/mcq/filtered?subject=${encodeURIComponent(subject)}&count=${count}&standard=${encodeURIComponent(apiStandard)}`);
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to load questions');
                setLoading(false);
                return;
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                setError('Questions data is not an array. Check API response.');
                setLoading(false);
                return;
            }
            const formatted = data.map((q, index) => {
                // If answer is a number string, treat as 1-based index
                let correctAnswerIndex = -1;
                if (typeof q.answer === 'string' && /^\d+$/.test(q.answer.trim())) {
                    const idx = parseInt(q.answer.trim(), 10) - 1;
                    if (idx >= 0 && idx < q.options.length) correctAnswerIndex = idx;
                } else {
                    // Otherwise, robust match by value
                    const answerValue = typeof q.answer === 'string' ? q.answer.trim().toLowerCase() : '';
                    const optionValues = q.options.map(opt => (opt.value || '').trim().toLowerCase());
                    correctAnswerIndex = optionValues.findIndex(opt => opt === answerValue);
                }

                // Robustly parse explanation value
                let explanationText = '';
                if (q.explanation) {
                    if (typeof q.explanation === 'string') {
                        explanationText = q.explanation;
                    } else if (typeof q.explanation === 'object' && q.explanation.value) {
                        explanationText = q.explanation.value;
                    }
                }

                return {
                    id: index + 1,
                    question: q.question?.value || 'No question text',
                    options: q.options.map(opt => opt.value),
                    correctAnswer: correctAnswerIndex,
                    explanation: explanationText
                };
            });
            setQuestions(formatted);
        } catch (err) {
            console.error(err);
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    // Removed startTimer in favor of interval inside the effect above

    const handleAnswerSelect = (questionId, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
        setShowExplanation(true);
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

    const stripTag = (val) => {
        if (typeof val !== 'string') return val;
        // Remove known tags
        return val.replace(/^(txt#\*#|eq#\*#|img#\*#)/, '').trim();
    };
    const handleSubmitTest = async () => {
        // Build a detailed per-question summary with selected and correct answers
        const answerSummary = questions.map((q, idx) => {
            const selectedIndex = answers[q.id];
            const correctIndex = q.correctAnswer;
            return {
                qNo: idx + 1,
                question: stripTag(q.question),
                selectedIndex,
                correctIndex,
                selected: typeof selectedIndex === 'number' ? stripTag(q.options[selectedIndex]) : null,
                correct: typeof correctIndex === 'number' ? stripTag(q.options[correctIndex]) : null,
                isCorrect: selectedIndex === correctIndex
            };
        });
        const score = answerSummary.reduce((acc, a) => acc + (a.isCorrect ? 1 : 0), 0);

        // Get user and group info (example: from localStorage or test object)
        //const teacherProfile = JSON.parse(localStorage.getItem('teacherProfile')) || {};
        const reportData = {
            group: test.group || test.groupName || 'Unknown',
            groupId: test.groupId || test.group_id || null,
            groupName: test.groupName || test.group || null,
            teacherEmail: test.teacherEmail || test.email || null,
            studentName,
            studentEmail,
            studentGender,
            studentDob,
            score,
            totalQuestions: questions.length,
            answers: answerSummary,
            testName: test.testName,
            subject: test.subject,
            standard: test.standard || (location.state?.params?.standard) || '',
            timeTaken: 3600 - timeLeft,
            date: new Date().toISOString(),
        };
        try {
            await fetch(`${API_BASE_URL}/api/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData),
            });
        } catch (err) {
            console.error('Failed to send test report:', err);
        }

        // Build a compact side-by-side results preview for the alert
        const preview = answerSummary
            .slice(0, Math.min(questions.length, 10))
            .map(a => `Q${a.qNo}: ${a.isCorrect ? '✅' : '❌'}  Sel: ${a.selected ?? '-'}  Ans: ${a.correct ?? '-'}`)
            .join('\n');
        const more = questions.length > 10 ? `\n...and ${questions.length - 10} more` : '';
        alert(`Test submitted!\nScore: ${score}/${questions.length}\n\n${preview}${more}`);
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
                    <span>Standard: {test.standard || (location.state?.params?.standard) || ''}</span>
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
                        <h3>{renderTextWithLatex(questions[currentQuestion].question)}</h3>
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
                                    <label htmlFor={`option-${index}`}>
                                        {renderTextWithLatex(option)}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {/* Show correct/wrong feedback and explanation after selection */}
                        {typeof answers[questions[currentQuestion].id] === 'number' && (
                            <div style={{ marginTop: '16px' }}>
                                {answers[questions[currentQuestion].id] === questions[currentQuestion].correctAnswer ? (
                                    <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Correct!</span>
                                ) : (
                                    <span style={{ color: 'red', fontWeight: 'bold' }}>❌ Incorrect!</span>
                                )}
                                <button
                                    style={{ marginLeft: '16px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #ccc', background: '#f8f9fa', cursor: 'pointer' }}
                                    onClick={() => setShowExplanation((prev) => !prev)}
                                >
                                    {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                                </button>
                                {showExplanation && (
                                    <div style={{ marginTop: '12px', background: '#f4f4f4', padding: '12px', borderRadius: '6px' }}>
                                        {/* Replace below with actual explanation/notes if available in question object */}
                                        <strong>Explanation:</strong>
                                        <div>
                                            {questions[currentQuestion].explanation
                                                ? renderTextWithLatex(questions[currentQuestion].explanation)
                                                : 'No explanation available for this question.'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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
