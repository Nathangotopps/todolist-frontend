import React, { useState, useEffect, useRef } from 'react'; 
import { ref, onValue, remove, update } from 'firebase/database'; // Confirmed top level update import
import { signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import PlaceHolder from './PlaceHolder';
import './App.css'; // This links your CSS rules directly to the React application!



import financialBg from './financial.jpg';
import fitnessBg from './fitness.jpg';
import academicBg from './academic.jpg';
import personalBg from './personalmiscellaneous.jpg';
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost/MYSQL_work/dashboard.php";
function App() {
  const [todos, setTodos] = useState([]);
  const audioInstanceRef = useRef(null);

  // --- 1. READ ALL URL VARIABLES TOGETHER RIGHT HERE ---
  const queryParameters = new URLSearchParams(window.location.search);
  const selectedCategory = queryParameters.get("category") || "general";
  
  // PASTE YOUR NEW THEME READER HERE!
  const activeThemeParam = queryParameters.get("theme") || "retro"; 

  // --- REAL, VERIFIED IDENTITY (replaces trusting a raw ?userId= param) ---
  // authStatus moves: 'checking' -> 'signedIn' | 'signedOut' | 'error'
  const [authStatus, setAuthStatus] = useState('checking');
  const [authUid, setAuthUid] = useState(null);
  const currentUserId = authUid; // kept as `currentUserId` so the rest of the file below barely changes

  // --- STATE FOR THE TRACK MUTE ENGINE ---
  const [isAppMuted, setIsAppMuted] = useState(false);

  // --- STATE FOR THE SUBCATEGORY DROPDOWN ---
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);
  const subcategoryDropdownRef = useRef(null);

  // --- BASE CATEGORY (everything before the "/", if any) ---
  // 'personal/social' -> 'personal', 'financial' -> 'financial'
  const baseCategory = selectedCategory.split('/')[0];

  // --- WHICH BASE CATEGORIES HAVE SUBCATEGORIES, AND WHAT THEY ARE ---
  const subcategoryMap = {
    'personal': [
      { key: 'personal/miscellaneous', label: 'Miscellaneous' },
      { key: 'personal/social', label: 'Social' },
      { key: 'personal/work', label: 'Work' },
      { key: 'personal/home', label: 'Home' },
    ]
    // add more base categories here later if they ever get subcategories too
  };
  const currentSubcategories = subcategoryMap[baseCategory];

  // Background/theme/music are shared across a category's subcategories,
  // so those maps key off baseCategory. Titles differ per subcategory,
  // so that map keys off the full selectedCategory string.
  const backgroundMap = {
    'financial': financialBg,
    'fitness': fitnessBg,
    'academic': academicBg,
    'personal': personalBg,
  };

  const titleMap = {
    'financial': "💰 My Financial Goals",
    'fitness': "🏋️ My Fitness Targets",
    'academic': "📚 My Academic Targets",
    'personal/miscellaneous': "🏠 My Personal To-Dos",
    'personal/social': "🎉 My Social To-Dos",
    'personal/work': "💼 My Work To-Dos",
    'personal/home': "🏡 My Home To-Dos",
    'general': "📝 General To-Do List" 
  };

  const currentTitle = titleMap[selectedCategory] || titleMap[baseCategory] || titleMap['general'];

    // 1. THE ADAPTIVE TEXT COLOR READABILITY MAP FOR BACKGROUND IMAGES
  const themeMap = {
    'financial': { textColor: '#ffffff', shadowColor: 'rgba(0,0,0,0.8)' }, 
    'fitness': { textColor: '#333333', shadowColor: 'rgba(255,255,255,0.8)' }, 
    'academic': { textColor: '#ffffff', shadowColor: 'rgba(0,0,0,0.7)' },
    'personal': { textColor: '#002244', shadowColor: 'rgba(255,255,255,0.9)' },
    'general': { textColor: '#333333', shadowColor: 'none' } 
  };
  const currentTheme = themeMap[baseCategory] || themeMap['general'];

  // 2. THE GLOBAL THEME CONFIGURATION PALETTES FROM YOUR SWITCHBOARD URL (COMPLETELY SEPARATE)
  const masterColorConfig = {
    'retro': { navbarBg: 'rgba(24, 24, 24, 0.95)', headerTextColor: '#ffffff' },
    'cyber': { navbarBg: 'rgba(16, 28, 48, 0.95)', headerTextColor: '#00f2fe' },
    'slate': { navbarBg: 'rgba(255, 255, 255, 0.95)', headerTextColor: '#2c3e50' }
  };
  const currentPalette = masterColorConfig[activeThemeParam] || masterColorConfig['retro'];


  

  // --- HOOK 0: SIGN IN WITH THE CUSTOM TOKEN FROM PHP (replaces trusting ?userId=) ---
  useEffect(() => {
    const tokenFromUrl = queryParameters.get("token");

    // Firebase persists sign-in across refreshes, so onAuthStateChanged will also
    // fire on its own for an already-active session, even with no token in the URL.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUid(user.uid);
        setAuthStatus('signedIn');
      } else if (!tokenFromUrl) {
        // No active session AND nothing to sign in with - send them back to log in properly.
        setAuthStatus('signedOut');
      }
    });

    if (tokenFromUrl) {
      signInWithCustomToken(auth, tokenFromUrl).catch((error) => {
        console.error("Sign-in failed:", error);
        setAuthStatus('error');
      });
    }

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HOOK 1: DATABASE SYNCHRONIZATION (only once we have a real, verified uid) ---
  useEffect(() => {
    if (!currentUserId) return; // wait for sign-in to resolve first

    const todosRef = ref(db, `users/${currentUserId}/${selectedCategory}`);
    const unsubscribe = onValue(todosRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const todosArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setTodos(todosArray);
      } else {
        setTodos([]);
      }
    });
    return () => unsubscribe();
  }, [currentUserId, selectedCategory]); 

  // --- HOOK 2: AUDIO ENGINE PIPELINE ---
  useEffect(() => {
    const musicMap = {
      'financial': '/financial.mp3',
      'fitness': '/fitness.mp3',
      'academic': '/academic.mp3',
      'personal': '/personal.mp3'
    };

    const currentTrack = musicMap[baseCategory];
    if (!currentTrack) return;

    const audio = new Audio(currentTrack);
    audio.loop = true;          
    audio.volume = 0.5;         
    audio.muted = isAppMuted; 

    audioInstanceRef.current = audio;
    audio.play().catch(error => {
      console.log("Audio playback constrained:", error);
    });

    return () => {
      audio.pause();
      audioInstanceRef.current = null;
    };
  }, [baseCategory, isAppMuted]); 

  // --- HOOK 3: CLOSE SUBCATEGORY DROPDOWN WHEN CLICKING OUTSIDE IT ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subcategoryDropdownRef.current &&
        !subcategoryDropdownRef.current.contains(event.target)
      ) {
        setIsSubcategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- DELETE TASK WITH RETRO CHIME ---
  const removeTodo = (id) => {
    const todoRef = ref(db, `users/${currentUserId}/${selectedCategory}/${id}`);
    
    // Play sound from the pre-loaded HTML audio element instead of constructing a raw asset box
    const appChime = document.getElementById('globalChime');
    if (appChime && !isAppMuted) {
      appChime.currentTime = 0; // Rewind sound instantly to allow fast consecutive clicks
      appChime.play().catch(err => console.log("Sound error: ", err));
    }

    remove(todoRef).catch(error => {
      console.error("Error deleting todo:", error);
    });
  };

  // --- TOGGLE TASK COMPLETION IN FIREBASE WITH DYNAMIC CHIME ---
  const toggleCompleteTodo = (id, currentStatus) => {
    const todoRef = ref(db, `users/${currentUserId}/${selectedCategory}/${id}`);
    
    // Trigger sound notification from pre-loaded HTML container elements
    if (!currentStatus && !isAppMuted) {
      const appChime = document.getElementById('globalChime');
      if (appChime) {
        appChime.currentTime = 0; 
        appChime.play().catch(err => console.log("Sound error: ", err));
      }
    }

    update(todoRef, {
      completed: !currentStatus
    })
    .then(() => console.log("Task completion updated for id:", id))
    .catch(error => console.error("Error updating completion:", error));
  };

  // --- INTERCEPT FADE OUT ENGINE ON BACK LINKS BUTTON NAVIGATION ---
  const handleBackToDashboard = (e) => {
    e.preventDefault(); 
    const activeAudio = audioInstanceRef.current;
    signOut(auth).catch((error) => console.error("Sign-out error:", error));
    
    if (activeAudio && !activeAudio.muted) {
      let volumeLevel = activeAudio.volume;
      const navFade = setInterval(() => {
        if (volumeLevel > 0.02) {
          volumeLevel -= 0.02;
          activeAudio.volume = Math.max(0, volumeLevel);
        } else {
          clearInterval(navFade);
          activeAudio.pause();
          window.location.href = DASHBOARD_URL; 
        }
      }, 20); 
    } else {
      window.location.href = DASHBOARD_URL;  
    }
  };

  // --- NAVIGATE TO A (SUB)CATEGORY, PRESERVING userId AND theme ---
  const navigateToCategory = (newCategory) => {
    const params = new URLSearchParams(window.location.search);
    params.set('category', newCategory);
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  const toggleMuteState = () => {
    setIsAppMuted(!isAppMuted);
  };

  const currentBg = backgroundMap[baseCategory] || personalBg;
  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  // --- AUTH GATES: don't show anyone's data until we know exactly whose it is ---
  if (authStatus === 'checking') {
    return (
      <div className="background-container" style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Checking your session...
      </div>
    );
  }

  if (authStatus === 'signedOut' || authStatus === 'error') {
    return (
      <div className="background-container" style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '20px' }}>
        <p>{authStatus === 'error' ? "Something went wrong signing you in." : "You need to log in first."}</p>
        <a href={DASHBOARD_URL} style={{ color: '#ffcc00', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
  ← Back to Dashboard
</a>
      </div>
    );
  }

  return (
    <div className="background-container" style={containerStyle}>

      {/* Fixed backdrop layer: pinned to the viewport (not the scrollable page), so if the
          content above/below is short the image never has to stretch or "reveal more of itself" -
          it just stays put as one properly-cropped screen behind whatever content exists. */}
      <div
        className="fixed-bg"
        style={{ backgroundImage: `url(${currentBg})` }}
      ></div>

      {/* 1. PRE-LOADED STABLE AUDIO COMPONENT VAULT (Bypasses browser autoplay policy blocks) */}
      <audio id="globalChime" src="/chime.mp3" preload="auto" style={{ display: 'none' }}></audio>

              {/* Top Fixed Navigation Header Bar */}
      <div className="app-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 30px', 
        backgroundColor: currentPalette.navbarBg, // DYNAMIC! Automatically flips color!
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10 
      }}>
        <h2 className="app-title" style={{ 
          margin: 0, 
          fontSize: '20px', 
          color: currentPalette.headerTextColor, // DYNAMIC! Automatically flips text color!
          fontFamily: 'Arial, sans-serif'
        }}>{currentTitle}</h2>
        
        {/* Right side of header: subcategory dropdown (if applicable) + back to dashboard */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* SUBCATEGORY DROPDOWN - only renders when the current base category has subcategories */}
          {currentSubcategories && (
            <div ref={subcategoryDropdownRef} style={{ position: 'relative' }}>
              <button
                className="subcategory-btn"
                onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${currentPalette.headerTextColor}`,
                  color: currentPalette.headerTextColor,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Subcategories {isSubcategoryOpen ? '▲' : '▼'}
              </button>

              {isSubcategoryOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  minWidth: '160px',
                  maxWidth: '90vw',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  zIndex: 20,
                  overflow: 'hidden'
                }}>
                  {currentSubcategories.map(sub => (
                    <div
                      key={sub.key}
                      onClick={() => navigateToCategory(sub.key)}
                      style={{
                        padding: '10px 16px',
                        color: sub.key === selectedCategory ? '#ffcc00' : '#ffffff',
                        fontWeight: sub.key === selectedCategory ? 'bold' : 'normal',
                        cursor: 'pointer',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Your back to dashboard anchor link remains exactly the same below... */}
          <a 
            className="back-link"
            href={DASHBOARD_URL}  
            onClick={handleBackToDashboard} 
            style={{ 
              textDecoration: 'none', 
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#ffcc00', // Swapped to Save Point Gold!
              color: '#121212', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
              transition: 'background-color 0.2s'
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>


      {/* Primary Task Frame Content Grid Layout Container */}
      <div className="App app-content" style={{ 
        paddingTop: '120px',
        color: currentTheme.textColor,
        textShadow: `1px 1px 3px ${currentTheme.shadowColor}`,
        transition: 'color 0.3s ease' 
      }}>
        
        <PlaceHolder />
        <TodoList todos={todos} removeTodo={removeTodo} toggleCompleteTodo={toggleCompleteTodo} />
        <AddTodoForm currentUserId={currentUserId} selectedCategory={selectedCategory} />
      </div>

      {/* FLOATING CORNER SPEAKER CONTEXT MUTE TOGGLE ICON ELEMENT */}
      <button 
        onClick={toggleMuteState}
        style={{
          position: 'fixed', 
          bottom: 'calc(20px + env(safe-area-inset-bottom))', 
          right: 'calc(20px + env(safe-area-inset-right))', 
          zIndex: 1000, 
          backgroundColor: '#333', 
          color: 'white', 
          border: 'none',
          borderRadius: '50%', 
          width: '50px', 
          height: '50px', 
          fontSize: '20px',
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        {isAppMuted ? '🔇' : '🔊'}
      </button>

    </div>
  );
}

export default App;