import '../styles/CTASection.css';

const links = ['About', 'Privacy', 'Contact'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        Edu<span>Assess</span> · PRMSU IBA
      </div>
      <div className="footer-note">
        © 2025 College of Teacher Education — President Ramon Magsaysay State University, Iba Main Campus
      </div>
      <div className="footer-links">
        {links.map((link) => (
          <a href="#" key={link}>{link}</a>
        ))}
      </div>
    </footer>
  );
}