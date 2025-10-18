import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import axios from "axios";
import "./Table.css";

import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

Modal.setAppElement("#root");

const Table = () => {
  const [questions, setQuestions] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [triggerSearch, setTriggerSearch] = useState(false);

  const IMAGE_SIZE = 120;

  /* ================================
   * Helpers for tolerant parsing
   * ================================ */
  const normalizeToken = (s) => {
    if (s == null) return "";
    let t = String(s);
    t = t.replace(/""/g, '"').trim();
    t = t.replace(/^,/, "").replace(/,+$/, "").trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      t = t.slice(1, -1);
    }
    t = t.replace(/^"+/, "").replace(/"+$/, "").trim();
    return t;
  };

  const splitTopLevelCSV = (s) => {
    if (!s) return [];
    const out = [];
    let buf = "";
    let inStr = false;
    let esc = false;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (esc) {
          esc = false;
          buf += ch;
        } else if (ch === "\\") {
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
      } else if (ch === ",") {
        out.push(buf);
        buf = "";
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
    let i = src.indexOf("[", keyIdx);
    if (i === -1) return null;
    let depth = 0;
    let inStr = false;
    let esc = false;
    let start = -1;

    for (; i < src.length; i++) {
      const ch = src[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') {
        inStr = true;
        continue;
      }
      if (ch === "[") {
        if (depth === 0) start = i + 1;
        depth++;
      } else if (ch === "]") {
        depth--;
        if (depth === 0) return src.slice(start, i);
      }
    }
    return null;
  };


  const ensureTagged = (cell) => {
    let v = normalizeToken(cell);
    if (!v) return "txt#*#";
    if (v.includes("#*#")) return v;
    if (/[\\^{}_]/.test(v)) {
      // Don't modify backslashes here - let LaTeX handle them
      return `eq#*#${v}`;
    }
    if (/\.(jpg|jpeg|png|gif)$/i.test(v)) {
      return `img#*#${v}`;
    }
    return `txt#*#${v}`;
  };

  /* ================================
   * Render tagged cells (eq/img/txt)
   * ================================ */
  const renderTaggedCell = (raw) => {
    if (raw == null) return "N/A";
    let val = normalizeToken(raw);
    const parts = val.split("#*#");

    if (parts.length < 2) {
      if (/[\\^{}_]/.test(val)) {
        // Don't modify backslashes - let LaTeX handle them properly
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
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        );
      }
      return val;
    }

    const tag = parts[0];
    let payload = parts.slice(1).join("#*#").trim();

    if (tag === "eq") {
      // Don't modify backslashes - let LaTeX handle them properly
      try {
        return <InlineMath math={payload} />;
      } catch {
        return `[Invalid LaTeX: ${payload}]`;
      }
    }
    if (tag === "img") {
      return (
        <img
          src={payload}
          alt="img"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      );
    }
    if (tag === "txt") {
      // Split text by \n to render line breaks
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

  /* ================================
   * Table parser (tolerant with repairs for LaTeX tables)
   * ================================ */
  const parseTableBlock = (block) => {
    try {
      let src = String(block).trim().replace(/^(table|tabl)#\*#/, "").trim();
      src = src.replace(/""/g, '"');
      let headers = ["txt#*#", "txt#*#List - I", "txt#*#", "txt#*#List - II"];
      let rows = [];
      try {
        const obj = JSON.parse(src);
        if (obj.th && obj.tr && Array.isArray(obj.th) && Array.isArray(obj.tr)) {
          headers = obj.th.map(ensureTagged);
          rows = obj.tr
            .map((row) => Array.isArray(row) ? row.map(ensureTagged) : [])
            .filter(row => row.length > 0);
        } else if (obj.th) {
          headers = obj.th.map(ensureTagged);
        }
      } catch (jsonErr) {
        const headerBody = extractBracketedAfterKey(src, '"th"') || "";
        const rowsBody = extractBracketedAfterKey(src, '"tr"') || "";
        if (headerBody) {
          headers = splitTopLevelCSV(headerBody).map(ensureTagged);
        }
        if (headers.length < 4) {
          headers = ["txt#*#", "txt#*#List - I", "txt#*#", "txt#*#List - II"];
        }
        if (rowsBody) {
          const rowStrings = rowsBody.split('],[').map(s => s.replace(/^\[|\]$/g, '').trim());
          rows = rowStrings.map(rowStr => {
            let cells = splitTopLevelCSV(rowStr);
            while (cells.length < 4) cells.push("txt#*#");
            cells = cells.slice(0, 4).map(ensureTagged);
            return cells;
          });
        }
        if (rows.length === 0 && src.includes("(A)") && src.includes("(D)")) {
          const rowData = src.split(/[[\]]/).filter(s => s.includes("(A)") || s.includes("(B)") || s.includes("(C)") || s.includes("(D)"));
          rows = rowData.map(rowStr => {
            let cells = splitTopLevelCSV(rowStr);
            while (cells.length < 4) cells.push("txt#*#");
            cells = cells.slice(0, 4).map(ensureTagged);
            return cells;
          });
        }
      }
      if (rows.length === 0) {
        rows.push(new Array(headers.length).fill("txt#*#"));
      }
      return { headers, rows };
    } catch (e) {
      console.error("Table parse error:", e);
      return {
        headers: ["txt#*#Column"],
        rows: [[`txt#*#${String(block)}`]],
      };
    }
  };

  /* ================================
   * Render text (with table support)
   * ================================ */
  const renderTextWithLatex = useCallback((text) => {
    if (!text || typeof text !== "string") {
      console.warn("Invalid text for rendering:", text);
      return <div className="content-wrapper">N/A</div>;
    }

    try {
      let src = text.replace(/^(txt#\*#|eq#\*#|img#\*#)/, "");
      // Don't modify backslashes globally - let LaTeX handle them properly
      const sections = src.split("#@#");
      const parts = [];

      // Process each section as a separate block (e.g., paragraph or element)
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
          const content = normalizeToken(match[2] || "");

          if (startIndex > lastIndex) {
            const plain = normalizeToken(sec.slice(lastIndex, startIndex));
            if (plain) {
              // Split plain text by \n for line breaks
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

          if (tag === "eq#*#") {
            try {
              sectionParts.push(<InlineMath key={`eq-${secIdx}-${sectionParts.length}`} math={content} />);
            } catch {
              sectionParts.push(<span key={`eqerr-${secIdx}-${sectionParts.length}`}>[Invalid LaTeX: {content}]</span>);
            }
          } else if (tag === "img#*#") {
            sectionParts.push(
              <img
                key={`img-${secIdx}-${sectionParts.length}`}
                src={content}
                alt="content"
                className="table-image"
              />
            );
          } else if (tag === "txt#*#") {
            // Split text content by \n for line breaks
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
                sectionParts.push(<InlineMath key={`eq-${secIdx}-${sectionParts.length}`} math={tail} />);
              } catch {
                // Split tail by \n for line breaks
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
              // Split tail by \n for line breaks
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

        // Wrap section parts in a div to separate from other sections
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
      console.warn("Rendering error:", err);
      return <div className="content-wrapper">[Rendering Error]</div>;
    }
  }, []);

  /* ================================
   * Fetch questions
   * ================================ */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const subjectMap = {
          "659fc35dc2444fa264d2b54b": "Botany",
          "659fc329c2444fa264d2b548": "Chemistry",
          "659fc324c2444fa264d2b546": "Physics",
          "659fc3c2c2444fa264d2b553": "Zoology",
        };

        const { data } = await axios.get("https://student-managment-backed.onrender.com/api/questions");
        const list = Array.isArray(data) ? data : [];

        const processed = list.map((q, idx) => {
          const options = {};
          ["0", "1", "2", "3"].forEach((k) => {
            options[k] =
              q.options && q.options[k]
                ? renderTextWithLatex(q.options[k].value)
                : "N/A";
          });
          return {
            mcqId: q.mcqId || `N/A-${idx}`,
            questionText: q.question?.value || "No text",
            options,
            answer: q.answer || "N/A",
            explanation: q.explanation?.value || "No explanation",
            subject: subjectMap[q.subjectId] || "General",
            standard: q.standard || "N/A",
          };
        });

        // Sort questions by MCQ ID
        const sortedQuestions = processed.sort((a, b) => {
          const getNumericPart = (mcqId) => {
            const match = mcqId.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          };
          
          const numA = getNumericPart(a.mcqId);
          const numB = getNumericPart(b.mcqId);
          
          return numA - numB;
        });

        setQuestions(sortedQuestions);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load questions: ${err.message}`);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [renderTextWithLatex]);

  /* ================================
   * Filter + Pagination
   * ================================ */
  const handleSearch = () => {
    setTriggerSearch(true);
    setCurrentPage(1);
  };

  const handleSubjectChange = (e) => {
    setSubjectFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleClassChange = (e) => {
    setClassFilter(e.target.value);
    setCurrentPage(1);
  };

  const filtered = questions.filter((q) => {
    const matchesSearch = !triggerSearch || !searchQuery || 
      q.mcqId.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "All" || q.subject === subjectFilter;
    const matchesClass = classFilter === "All" || q.standard === classFilter;
    return matchesSearch && matchesSubject && matchesClass;
  });

  const totalPages = Math.ceil(filtered.length / questionsPerPage);
  const indexOfLast = currentPage * questionsPerPage;
  const indexOfFirst = indexOfLast - questionsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);

  /* ================================
   * UI
   * ================================ */
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="table-container">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="card-modal"
        overlayClassName="modal-overlay"
      >
        {selectedQuestion && (
          <div className="card">
            <button className="close-btn" onClick={() => setModalIsOpen(false)}>×</button>
            <h2>Question Details</h2>
            <p><strong>MCQ ID:</strong> {selectedQuestion.mcqId}</p>
            <div className="row mt-2">
              <div className="col-lg-12">
                <p className="card-text">Question</p>
                <div className="card-text option-card px-2 py-2">
                  <div className="row align-items-center optionMove">
                    <div className="col-12">{renderTextWithLatex(selectedQuestion.questionText)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-lg-12">
                <div
                  className="card-text option-card px-2 py-2"
                  style={{ border: `${selectedQuestion.answer === "1" ? 3 : 0}px solid #18cc45` }}
                >
                  <div className="row align-items-center optionMove">
                    <div className="col-2">
                      <span style={{ fontSize: 12, marginTop: 12 }}>(1)</span>
                    </div>
                    <div className="col-9">{selectedQuestion.options["0"]}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-lg-12">
                <div
                  className="card-text option-card px-2 py-2"
                  style={{ border: `${selectedQuestion.answer === "2" ? 3 : 0}px solid #18cc45` }}
                >
                  <div className="row align-items-center optionMove">
                    <div className="col-2">
                      <span style={{ fontSize: 12, marginTop: 12 }}>(2)</span>
                    </div>
                    <div className="col-9">{selectedQuestion.options["1"]}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-lg-12">
                <div
                  className="card-text option-card px-2 py-2"
                  style={{ border: `${selectedQuestion.answer === "3" ? 3 : 0}px solid #18cc45` }}
                >
                  <div className="row align-items-center optionMove">
                    <div className="col-2">
                      <span style={{ fontSize: 12 }}>(3)</span>
                    </div>
                    <div className="col-9">{selectedQuestion.options["2"]}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-lg-12">
                <div
                  className="card-text option-card px-2 py-2"
                  style={{ border: `${selectedQuestion.answer === "4" ? 3 : 0}px solid #18cc45` }}
                >
                  <div className="row align-items-center optionMove">
                    <div className="col-2">
                      <span style={{ fontSize: 12 }}>(4)</span>
                    </div>
                    <div className="col-9">{selectedQuestion.options["3"]}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-lg-12">
                <p className="card-text">Explanation</p>
                <div className="col-lg-12">{renderTextWithLatex(selectedQuestion.explanation)}</div>
              </div>
            </div>
            <p><strong>Subject:</strong> {selectedQuestion.subject}</p>
            <p><strong>Standard:</strong> {selectedQuestion.standard}</p>
          </div>
        )}
      </Modal>

      <div className="controls">
        <input
          placeholder="Search by MCQ ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={subjectFilter} onChange={handleSubjectChange}>
          <option value="All">All Subjects</option>
          {[...new Set(questions.map((q) => q.subject))].map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <select value={classFilter} onChange={handleClassChange}>
          <option value="All">All Classes</option>
          <option value="XI">XI</option>
          <option value="XII">XII</option>
        </select>
        <button onClick={handleSearch} className="search-btn">Search</button>
      </div>

      <div className="table-wrapper">
        <table className="questions-table">
          <thead>
            <tr>
              <th>Quick View</th>
              <th>SI.NO.</th>
              <th>MCQ ID</th>
              <th>Question</th>
              <th>Option 1</th>
              <th>Option 2</th>
              <th>Option 3</th>
              <th>Option 4</th>
              <th>Answer</th>
              <th>Explanation</th>
              <th>Subject</th>
              <th>Standard</th>
            </tr>
          </thead>
          <tbody>
            {current.map((q, i) => (
              <tr key={q.mcqId || i}>
                <td>
                  <button
                    className="quick-btn"
                    onClick={() => {
                      setSelectedQuestion(q);
                      setModalIsOpen(true);
                    }}
                  >
                    👁️
                  </button>
                </td>
                <td>{indexOfFirst + i + 1}</td>
                <td>{q.mcqId}</td>
                <td>{renderTextWithLatex(q.questionText)}</td>
                <td>{q.options["0"]}</td>
                <td>{q.options["1"]}</td>
                <td>{q.options["2"]}</td>
                <td>{q.options["3"]}</td>
                <td>{q.answer}</td>
                <td>{renderTextWithLatex(q.explanation)}</td>
                <td>{q.subject}</td>
                <td>{q.standard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="pagination-btn"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          const range = 2;
          if (
            p === 1 ||
            p === totalPages ||
            (p >= currentPage - range && p <= currentPage + range)
          ) {
            return (
              <button
                key={p}
                className={`pagination-btn ${p === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            );
          } else if (
            (p === currentPage - range - 1 && currentPage - range > 2) ||
            (p === currentPage + range + 1 && currentPage + range < totalPages - 1)
          ) {
            return <span key={p} className="pagination-ellipsis">...</span>;
          }
          return null;
        })}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
