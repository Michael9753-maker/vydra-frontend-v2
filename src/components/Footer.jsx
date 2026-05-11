import { Link } from "react-router-dom";
import "../styles/Footer.css"; // Optional: create this file to hold styles

export default function Footer() {
  return (
    <footer className="vydra-footer" role="contentinfo">
      <div className="vydra-footer__links">
        <Link to="/" className="vydra-footer__link">Home</Link>
        <Link to="/download" className="vydra-footer__link">Download</Link>
        <Link to="/ai-studio" className="vydra-footer__link">AI Studio</Link>
        <Link to="/premium" className="vydra-footer__link">Premium</Link>
        <Link to="/legal" className="vydra-footer__link">Legal & Policies</Link>
      </div>

      <div className="vydra-footer__copyright">
        &copy; 2026 VYDRA. All rights reserved.
      </div>
    </footer>
  );
}
