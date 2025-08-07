import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CalendarDays, Table2, FileText, Menu } from 'lucide-react';
import styles from './Navbar.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'as', label: 'Assamese' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'or', label: 'Odia (Oriya)' },
  { code: 'bn', label: 'Bengali' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ur', label: 'Urdu' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('teacherEmail');
    navigate('/signin');
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setLanguageMenuOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setLanguageMenuOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navActions}>
        <button 
          onClick={() => navigate('/create-group')} 
          className={styles.navAction}
        >
          <PlusCircle size={18} />
          <span>New Group/Team</span>
        </button>
        <button 
          onClick={() => navigate('/test-schedule')} 
          className={styles.navAction}
        >
          <CalendarDays size={18} />
          <span>Test Schedule</span>
        </button>
        <button 
          onClick={() => navigate('/student-table')} 
          className={styles.navAction}
        >
          <Table2 size={18} />
          <span>Student Table</span>
        </button>
        <button 
          onClick={() => navigate('/reports')} 
          className={styles.navAction}
        >
          <FileText size={18} />
          <span>Reports</span>
        </button>
      </div>
      <div className={styles.navUser} ref={dropdownRef}>
        <button
          className={styles.dropdownToggle}
          onClick={() => setDropdownOpen((open) => !open)}
        >
          <Menu size={18} />
          Menu ▾
        </button>
        {dropdownOpen && (
          <div className={styles.dropdownMenu}>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false);
                // Implement Help logic here
                alert('Help section coming soon!');
              }}
            >
              Help
            </button>
            <div
              className={styles.dropdownItem}
              onMouseEnter={() => setLanguageMenuOpen(true)}
              onMouseLeave={() => setLanguageMenuOpen(false)}
              style={{ position: 'relative' }}
            >
              <span>
                Language: {selectedLanguage.label} ▸
              </span>
              {languageMenuOpen && (
                <div className={styles.languageMenu}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      className={styles.languageItem}
                      onClick={() => handleLanguageSelect(lang)}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className={styles.dropdownItem}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;