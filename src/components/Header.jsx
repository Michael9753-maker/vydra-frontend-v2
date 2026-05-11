import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header({ user, onOpenLogin, onLogout }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 10);

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`vydra-header
        ${hidden ? "vydra-header--hidden" : ""}
        ${scrolled ? "vydra-header--scrolled" : ""}`}
    >
      <div className="vydra-header__inner">

        <div className="vydra-logo">
          <Link to="/" aria-label="VYDRA Home">
            VYDRA
          </Link>
        </div>

        <nav className="vydra-nav" aria-label="Main navigation">
          <Link to="/" className="vydra-nav__link">
            Home
          </Link>

          <Link to="/download" className="vydra-nav__link vydra-nav__download">
            Download
          </Link>

          <Link to="/invite" className="vydra-nav__link">
            Referral
          </Link>
        </nav>

        <div className="vydra-actions">
          {user ? (
            <>
              <span className="vydra-user">Logged in</span>
              <button className="btn btn-ghost" onClick={onLogout}>
                Sign out
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
