import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Header({ user, onOpenLogin, onLogout }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      setScrolled(currentScrollY > 10);

      if (menuOpen) {
        setHidden(false);
      } else if (currentScrollY <= 80) {
        setHidden(false);
      } else if (currentScrollY > lastScrollY) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`vydra-header
        ${hidden && !menuOpen ? "vydra-header--hidden" : ""}
        ${scrolled ? "vydra-header--scrolled" : ""}
        ${menuOpen ? "vydra-header--menu-open" : ""}`}
    >
      <div className="vydra-header__inner">
        <div className="vydra-logo">
          <Link to="/" aria-label="VYDRA Home" onClick={closeMenu}>
            VYDRA
          </Link>
        </div>

        <div
          id="vydra-mobile-navigation"
          className={`vydra-header__menu ${menuOpen ? "is-open" : ""}`}
        >
          <nav className="vydra-nav" aria-label="Main navigation">
            <Link to="/" className="vydra-nav__link" onClick={closeMenu}>
              Home
            </Link>

            <Link
              to="/download"
              className="vydra-nav__link vydra-nav__download"
              onClick={closeMenu}
            >
              Download
            </Link>

            <Link
              to="/invite"
              className="vydra-nav__link"
              onClick={closeMenu}
            >
              Referral
            </Link>
          </nav>

          <div className="vydra-actions">
            {user ? (
              <>
                <span className="vydra-user">Logged in</span>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    closeMenu();
                    onLogout?.();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  closeMenu();
                  onOpenLogin?.();
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`vydra-mobile-toggle ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="vydra-mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="vydra-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
