// 📁 frontend/src/components/Navbar.jsx
import '../styles/Navbar.css';
import useAuthStore from '../auth/useAuthStore';

export default function Navbar() {
  const setAuthModal = useAuthStore((state) => state.setAuthModal);

  return (
    <nav className="navbar">
      <a href="#" className="nav-brand">
        <div className="nav-seal">
          <img
            src="https://prmsu-spms.cloud/assets/img/PRMSU.png"
            alt="PRMSU Logo"
          />
        </div>
        <div className="nav-wordmark">
          <span>EduAssess</span>
          <span>PRMSU · College of Teacher Education · College of Industrial Technology</span>
        </div>
      </a>

      <ul className="nav-links">
        <li><a href="#" className="active">About</a></li>
        <li><a href="#mission">Mission</a></li>
        <li><a href="#mac">Access Model</a></li>
        <li><a href="#platform">Platform</a></li>

        <li>
          <button onClick={() => setAuthModal(true, 'login')} className="nav-cta login-btn">
            Login
          </button>
        </li>

        <li>
          <button onClick={() => setAuthModal(true, 'register')} className="nav-cta register-btn">
            Register
          </button>
        </li>
      </ul>
    </nav>
  );
}