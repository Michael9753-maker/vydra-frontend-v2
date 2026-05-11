import React, { useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PremiumContext } from "../context/PremiumContext";
import { useAuth } from "../context/AuthContext";

function IconPlay({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconArrowRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13 5l7 7-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5z"
      />
    </svg>
  );
}

function IconCheck({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4z" />
    </svg>
  );
}

function IconSpark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13 2l-1 5-5 1 5 1 1 5 1-5 5-1-5-1-1-5zM2 20l20-1-4 3-3 2-3-2-4-2z"
      />
    </svg>
  );
}

function IconShield({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l7 3v6c0 5-3.2 9.4-7 11-3.8-1.6-7-6-7-11V5l7-3zm0 4.2L7 8v3c0 3.6 2.1 6.9 5 8.2 2.9-1.3 5-4.6 5-8.2V8l-5-1.8z"
      />
    </svg>
  );
}

function IconBolt({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function IconYoutube({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"
      />
    </svg>
  );
}

function IconTiktok({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 3c.6 2.5 2.1 4 4.5 4.2v3.1c-1.4 0-2.9-.4-4.5-1.3v5.5c0 4-3.2 6.5-6.4 6.5-2.8 0-5.6-1.9-5.6-5.4 0-3.8 3.5-6.2 7.1-5.4v3.4c-1.6-.4-3.3.7-3.3 2.3 0 1.4 1.1 2.4 2.5 2.4 1.6 0 3.1-1.2 3.1-3.4V3h2.6z"
      />
    </svg>
  );
}

function IconInstagram({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.7 6.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"
      />
    </svg>
  );
}

function IconFacebook({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v8h3v-8h3l1-3h-4V9c0-.6.4-1 1-1z"
      />
    </svg>
  );
}

function IconX({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 3H22l-6.8 7.8L23 21h-6.4l-5-6.2L6.2 21H3l7.3-8.4L1 3h6.6l4.5 5.6L18.9 3zm-1.1 16h1.7L6.7 4.9H5L17.8 19z"
      />
    </svg>
  );
}

const platformItems = [
  { name: "YouTube", icon: <IconYoutube />, color: "#FF0000", bg: "rgba(255,0,0,0.12)" },
  { name: "TikTok", icon: <IconTiktok />, color: "#010101", bg: "rgba(255,255,255,0.9)" },
  { name: "Instagram", icon: <IconInstagram />, color: "#E1306C", bg: "rgba(225,48,108,0.12)" },
  { name: "Facebook", icon: <IconFacebook />, color: "#1877F2", bg: "rgba(24,119,242,0.12)" },
  { name: "Vimeo", icon: <IconPlay />, color: "#1AB7EA", bg: "rgba(26,183,234,0.12)" },
  { name: "X / Twitter", icon: <IconX />, color: "#111111", bg: "rgba(255,255,255,0.08)" },
];

const features = [
  {
    title: "Universal Downloader",
    desc: "Download from TikTok, YouTube, Instagram, Facebook, Vimeo, and more with a clean workflow.",
    icon: <IconPlay />,
    tone: "purple",
  },
  {
    title: "AI Enhancement",
    desc: "Upscale resolution, sharpen details, reduce noise, and prepare content for premium-quality publishing.",
    icon: <IconSpark />,
    tone: "pink",
  },
  {
    title: "Pro Creator Tools",
    desc: "Auto-captions, smart subtitles, editing helpers, and fast video handling built for creators.",
    icon: <IconBolt />,
    tone: "blue",
  },
  {
    title: "Privacy First",
    desc: "No clutter, no tracking noise, and no unnecessary friction. Your workflow stays yours.",
    icon: <IconShield />,
    tone: "green",
  },
];

const stats = [
  { label: "Videos processed", value: "10M+", tone: "purple" },
  { label: "Happy creators", value: "500K+", tone: "pink" },
  { label: "Platforms", value: "50+", tone: "blue" },
  { label: "Uptime", value: "99.9%", tone: "green" },
];

const howItWorks = [
  { step: "1", title: "Paste URL", desc: "Copy a video link from your favorite platform.", tone: "purple" },
  { step: "2", title: "Select quality", desc: "Choose HD, SD, or audio-only format.", tone: "pink" },
  { step: "3", title: "Download", desc: "Click download and save it instantly.", tone: "blue" },
];

const toneColors = {
  purple: {
    title: "#cbbcff",
    iconBg: "rgba(124,91,255,0.16)",
    iconBorder: "rgba(124,91,255,0.14)",
    stepBg: "linear-gradient(90deg, #7c5bff, #b49dff)",
  },
  pink: {
    title: "#ff9fc2",
    iconBg: "rgba(225,48,108,0.14)",
    iconBorder: "rgba(225,48,108,0.14)",
    stepBg: "linear-gradient(90deg, #e1306c, #ff8fb4)",
  },
  blue: {
    title: "#9dd8ff",
    iconBg: "rgba(26,183,234,0.14)",
    iconBorder: "rgba(26,183,234,0.14)",
    stepBg: "linear-gradient(90deg, #1ab7ea, #8cd8ff)",
  },
  green: {
    title: "#9af0c3",
    iconBg: "rgba(34,197,94,0.14)",
    iconBorder: "rgba(34,197,94,0.14)",
    stepBg: "linear-gradient(90deg, #22c55e, #9af0c3)",
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { isPremium } = useContext(PremiumContext);
  const { user } = useAuth();

  const trustPills = useMemo(() => ["No watermark", "Private by design", "Up to 4K quality"], []);

  return (
    <main style={styles.page}>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-8px) translateX(6px) scale(1.03); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 10px 30px rgba(124,91,255,0.10); }
          50% { box-shadow: 0 18px 56px rgba(124,91,255,0.30); }
          100% { box-shadow: 0 10px 30px rgba(124,91,255,0.10); }
        }
        @keyframes shimmerMove {
          0% { transform: translateX(-30%); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes drift {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(18px, -14px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes pageSweepMove {
          0% { transform: translateX(-35%) skewX(-16deg); opacity: 0; }
          14% { opacity: 0.55; }
          45% { opacity: 0.12; }
          100% { transform: translateX(135%) skewX(-16deg); opacity: 0; }
        }
        @keyframes gentleFloatA {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.01); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes gentleFloatB {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-5px) translateX(3px) scale(1.01); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        @keyframes gentleFloatC {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(3px) translateX(-4px) scale(1.015); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        .hero-card:hover { transform: translateY(-2px); }
        .feature-card:hover { transform: translateY(-4px) scale(1.01); }
        .platform-pill:hover { transform: translateY(-2px) scale(1.02); }
        .cta-btn:hover { transform: translateY(-2px); }
        .floating-badge { animation: floatUp 5s ease-in-out infinite; }
        .glow-strong { animation: pulseGlow 3.6s ease-in-out infinite; }
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          animation: shimmerMove 4.5s ease-in-out infinite;
        }
        .page-sweep {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background:
            linear-gradient(115deg, transparent 38%, rgba(124,91,255,0.06) 46%, rgba(62,199,192,0.08) 50%, rgba(255,255,255,0.05) 54%, transparent 62%);
          animation: pageSweepMove 16s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        .float-natural-a { animation: gentleFloatA 6.8s ease-in-out infinite; }
        .float-natural-b { animation: gentleFloatB 7.8s ease-in-out infinite; }
        .float-natural-c { animation: gentleFloatC 8.6s ease-in-out infinite; }
        .hero-cta-button {
          position: relative;
          overflow: hidden;
          box-shadow:
            0 18px 50px rgba(62,199,192,0.18),
            0 0 0 1px rgba(255,255,255,0.06) inset,
            0 0 28px rgba(124,91,255,0.24);
        }
        .hero-cta-button::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.22), rgba(255,255,255,0.06));
          filter: blur(10px);
          opacity: 0.75;
          z-index: 0;
          animation: pulseGlow 3.2s ease-in-out infinite;
        }
        .hero-cta-button > * { position: relative; z-index: 1; }
        .hero-cta-button:hover {
          box-shadow:
            0 22px 64px rgba(62,199,192,0.24),
            0 0 0 1px rgba(255,255,255,0.08) inset,
            0 0 36px rgba(124,91,255,0.32);
        }
        @media (max-width: 960px) {
          .grid-2, .stats-grid, .feature-grid, .how-grid, .footer-grid { grid-template-columns: 1fr !important; }
          .hero-actions { flex-direction: column !important; align-items: stretch !important; }
          .platform-list { justify-content: center !important; }
        }
      `}</style>

      <div className="page-sweep" />

      <section style={styles.shell}>
        <div className="hero-card" style={styles.heroCard}>
          <div style={styles.heroBgBlob1} />
          <div style={styles.heroBgBlob2} />
          <div style={styles.heroBgBlob3} />
          <div style={styles.heroSpotlight} />
          <div style={styles.heroSpotlight2} />
          <div style={styles.heroGridLines} />
          <div style={styles.heroNoise} />

          <div style={styles.heroTopline} className="floating-badge">
            <span style={styles.heroBadge}>
              <IconSpark size={14} />
            </span>
            <span style={styles.heroToplineText}>AI-Powered Video Platform</span>
          </div>

          <div style={styles.heroCenter}>
            <h1 style={styles.heroTitle}>
              <span style={styles.heroTitleWhite}>VYDRA</span>{" "}
              <span style={styles.heroTitleGradient}>🚀</span>
              <br />
              <span style={styles.heroSubtitleLine}>Download, enhance, and edit videos</span>
              <br />
              <span style={styles.heroAccent}>from any platform</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Download, enhance, and edit videos from any platform with{" "}
              <span style={styles.inlineHighlight}>AI-powered tools</span>.
            </p>

            <div style={styles.heroActions} className="hero-actions">
              <button
                onClick={() => navigate("/download")}
                style={styles.primaryLargeBtn}
                className="cta-btn glow-strong hero-cta-button"
              >
                <span>Download Now</span>
                <IconArrowRight size={16} />
              </button>
            </div>

            <div style={styles.trustRow}>
              {trustPills.map((pill, index) => (
                <span
                  key={pill}
                  style={{
                    ...styles.trustPill,
                    animationDelay: `${index * 0.15}s`,
                  }}
                  className={index % 3 === 0 ? "float-natural-a" : index % 3 === 1 ? "float-natural-b" : "float-natural-c"}
                >
                  <IconCheck size={12} />
                  {pill}
                </span>
              ))}
            </div>

            <div style={styles.platformSection}>
              <div style={styles.platformSectionTitle}>Supported platforms</div>
              <div style={styles.platformRow} className="platform-list">
                {platformItems.map((platform, index) => (
                  <div
                    key={platform.name}
                    style={{
                      ...styles.platformPill,
                      color: platform.color,
                      background: platform.bg,
                      borderColor: `${platform.color}33`,
                      animationDelay: `${index * 0.08}s`,
                    }}
                    className={index % 3 === 0 ? "float-natural-a platform-pill" : index % 3 === 1 ? "float-natural-b platform-pill" : "float-natural-c platform-pill"}
                  >
                    <span style={{ ...styles.platformIcon, color: platform.color }}>{platform.icon}</span>
                    <span>{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section style={styles.statsGrid} className="stats-grid">
          {stats.map((item, index) => {
            const tone = toneColors[item.tone];
            return (
              <article
                key={item.label}
                style={{ ...styles.statCard, animationDelay: `${index * 0.12}s` }}
                className="floating-badge"
              >
                <div style={{ ...styles.statValue, color: tone.title }}>{item.value}</div>
                <div style={styles.statLabel}>{item.label}</div>
              </article>
            );
          })}
        </section>

        <section style={styles.sectionBlock}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Everything you need for <span style={styles.sectionHighlight}>video magic</span>
            </h2>
            <p style={styles.sectionDesc}>
              From downloading to professional editing, VYDRA has the tools to transform your workflow.
            </p>
          </div>

          <div style={styles.featureGrid} className="feature-grid">
            {features.map((feature, index) => {
              const tone = toneColors[feature.tone];
              return (
                <article
                  key={feature.title}
                  style={{
                    ...styles.featureCard,
                    animationDelay: `${index * 0.12}s`,
                  }}
                  className="feature-card floating-badge"
                >
                  <div
                    style={{
                      ...styles.featureIcon,
                      color: tone.title,
                      background: tone.iconBg,
                      border: `1px solid ${tone.iconBorder}`,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 style={{ ...styles.featureTitle, color: tone.title }}>{feature.title}</h3>
                  <p style={styles.featureDesc}>{feature.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section style={styles.sectionBlock}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How it works</h2>
            <p style={styles.sectionDesc}>Simple, fast, and built to reduce friction.</p>
          </div>

          <div style={styles.howGrid} className="how-grid">
            {howItWorks.map((item, index) => {
              const tone = toneColors[item.tone];
              return (
                <article
                  key={item.step}
                  style={{ ...styles.howCard, animationDelay: `${index * 0.12}s` }}
                  className="floating-badge"
                >
                  <div style={{ ...styles.howStep, background: tone.stepBg }}>{item.step}</div>
                  <h3 style={{ ...styles.howTitle, color: tone.title }}>{item.title}</h3>
                  <p style={styles.howDesc}>{item.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section style={styles.ctaBlock} className="shimmer">
          <h2 style={styles.ctaTitle}>Ready to transform your videos?</h2>
          <p style={styles.ctaDesc}>
            Join creators who trust <span style={styles.inlineHighlight}>VYDRA</span> for fast downloads, AI
            enhancement, and cleaner workflows.
          </p>
          <div style={styles.heroActions} className="hero-actions">
            <button
              onClick={() => navigate("/download")}
              style={styles.primaryLargeBtn}
              className="cta-btn glow-strong hero-cta-button"
            >
              <span>Download Now</span>
              <IconArrowRight size={16} />
            </button>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerGrid} className="footer-grid">
            <div style={styles.footerBrandBlock}>
              <div style={styles.footerBrand}>VYDRA</div>
              <p style={styles.footerText}>
                The ultimate AI-powered video platform for creators worldwide.
              </p>
            </div>

            <div>
              <div style={styles.footerTitle}>Platform</div>
              <div style={styles.footerLink}>Features</div>
              <div style={styles.footerLink}>Pricing</div>
              <div style={styles.footerLink}>API</div>
              <div style={styles.footerLink}>Support</div>
            </div>

            <div>
              <div style={styles.footerTitle}>Help</div>
              <div style={styles.footerLink}>Help Center</div>
              <div style={styles.footerLink}>Contact</div>
              <div style={styles.footerLink}>support.vydra@gmail.com</div>
            </div>

            <div>
              <div style={styles.footerTitle}>Legal</div>
              <div style={styles.footerLink}>Privacy Policy</div>
              <div style={styles.footerLink}>Terms of Service</div>
              <div style={styles.footerLink}>Report Abuse</div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <span>© 2026 VYDRA. All rights reserved. Domain: vydra.video</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {user?.email ? <span style={styles.footerUser}>Signed in as {user.email}</span> : null}
              {isPremium ? <span style={styles.footerUser}>Premium active</span> : null}
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px 18px 64px",
    color: "white",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top center, rgba(124,91,255,0.12), transparent 32%), radial-gradient(circle at bottom right, rgba(62,199,192,0.08), transparent 28%), #07080d",
  },
  shell: {
    maxWidth: 1200,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    padding: 28,
    borderRadius: 24,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 16px 50px rgba(0,0,0,0.32)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    textAlign: "center",
    isolation: "isolate",
  },
  heroBgBlob1: {
    position: "absolute",
    inset: "-10% auto auto -10%",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,91,255,0.22) 0%, rgba(124,91,255,0.08) 35%, transparent 70%)",
    filter: "blur(18px)",
    animation: "floatUp 8s ease-in-out infinite",
    pointerEvents: "none",
  },
  heroBgBlob2: {
    position: "absolute",
    inset: "auto -8% 12% auto",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(62,199,192,0.18) 0%, rgba(62,199,192,0.06) 35%, transparent 72%)",
    filter: "blur(20px)",
    animation: "floatUp 10s ease-in-out infinite",
    pointerEvents: "none",
  },
  heroBgBlob3: {
    position: "absolute",
    inset: "30% 20% auto auto",
    width: 160,
    height: 160,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(225,48,108,0.14) 0%, rgba(225,48,108,0.05) 35%, transparent 70%)",
    filter: "blur(18px)",
    animation: "floatUp 11s ease-in-out infinite",
    pointerEvents: "none",
  },
  heroSpotlight: {
    position: "absolute",
    inset: "10% 18% auto 18%",
    height: 240,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,91,255,0.18) 0%, rgba(62,199,192,0.10) 42%, transparent 72%)",
    filter: "blur(12px)",
    animation: "drift 12s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroSpotlight2: {
    position: "absolute",
    inset: "55% 28% auto 28%",
    height: 180,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(225,48,108,0.14) 0%, rgba(225,48,108,0.05) 38%, transparent 72%)",
    filter: "blur(14px)",
    animation: "drift 14s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroGridLines: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
    backgroundSize: "64px 64px",
    maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
    opacity: 0.22,
    pointerEvents: "none",
    zIndex: 0,
  },
  heroNoise: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.04) 0, transparent 35%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.03) 0, transparent 32%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.025) 0, transparent 30%)",
    opacity: 0.35,
    pointerEvents: "none",
    zIndex: 0,
  },
  heroTopline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "rgba(230,235,245,0.96)",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 18,
    position: "relative",
    zIndex: 2,
  },
  heroBadge: {
    width: 22,
    height: 22,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(124,91,255,0.18)",
    color: "#d9d0ff",
  },
  heroToplineText: {
    color: "#f4f1ff",
  },
  heroCenter: {
    position: "relative",
    zIndex: 2,
    maxWidth: 920,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heroTitle: {
    margin: 0,
    fontSize: 58,
    lineHeight: 0.95,
    letterSpacing: "-0.05em",
  },
  heroTitleWhite: {
    color: "#ffffff",
  },
  heroTitleGradient: {
    background: "linear-gradient(90deg, #7c5bff, #e1306c, #1ab7ea)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  heroSubtitleLine: {
    color: "#e5e7eb",
    fontSize: 34,
    fontWeight: 900,
  },
  heroAccent: {
    background: "linear-gradient(90deg, #7c5bff, #3ec7c0)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    fontSize: 34,
    fontWeight: 900,
  },
  heroSubtitle: {
    marginTop: 14,
    maxWidth: 760,
    color: "rgba(220,228,240,0.9)",
    fontSize: 18,
    lineHeight: 1.55,
  },
  inlineHighlight: {
    color: "#8fe4df",
    fontWeight: 800,
  },
  heroActions: {
    marginTop: 24,
    display: "flex",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  primaryLargeBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "15px 22px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(90deg, #7c5bff, #3ec7c0)",
    color: "#081018",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 18px 50px rgba(62,199,192,0.18)",
  },
  trustRow: {
    marginTop: 20,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  trustPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(235,240,250,0.95)",
    fontSize: 13,
    fontWeight: 700,
  },
  platformSection: {
    marginTop: 24,
    width: "100%",
  },
  platformSectionTitle: {
    color: "rgba(234,238,248,0.92)",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 10,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    textAlign: "center",
  },
  platformRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  platformPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    transition: "transform 180ms ease, box-shadow 180ms ease",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  platformIcon: {
    display: "grid",
    placeItems: "center",
  },
  statsGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  statCard: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 34px rgba(0,0,0,0.22)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
    textAlign: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },
  statLabel: {
    marginTop: 8,
    color: "rgba(200,210,230,0.7)",
    fontSize: 13,
    fontWeight: 700,
  },
  sectionBlock: {
    marginTop: 16,
    padding: 22,
    borderRadius: 24,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    textAlign: "center",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    margin: 0,
    color: "white",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  sectionHighlight: {
    background: "linear-gradient(90deg, #7c5bff, #3ec7c0)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  sectionDesc: {
    marginTop: 8,
    color: "rgba(200,210,230,0.72)",
    maxWidth: 760,
    lineHeight: 1.55,
    marginLeft: "auto",
    marginRight: "auto",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },
  featureCard: {
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 32px rgba(0,0,0,0.18)",
    transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
    textAlign: "left",
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    marginBottom: 14,
  },
  featureTitle: {
    margin: 0,
    color: "white",
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },
  featureDesc: {
    marginTop: 8,
    color: "rgba(200,210,230,0.78)",
    fontSize: 14,
    lineHeight: 1.6,
  },
  howGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },
  howCard: {
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
    textAlign: "left",
  },
  howStep: {
    width: 38,
    height: 38,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    color: "#081018",
    fontWeight: 900,
    marginBottom: 14,
  },
  howTitle: {
    margin: 0,
    color: "white",
    fontSize: 18,
    fontWeight: 900,
  },
  howDesc: {
    marginTop: 8,
    color: "rgba(200,210,230,0.78)",
    lineHeight: 1.6,
  },
  ctaBlock: {
    marginTop: 16,
    padding: 26,
    borderRadius: 24,
    background:
      "radial-gradient(circle at top left, rgba(124,91,255,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(62,199,192,0.10), transparent 28%), rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    textAlign: "center",
  },
  ctaTitle: {
    margin: 0,
    color: "white",
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  ctaDesc: {
    marginTop: 10,
    color: "rgba(200,210,230,0.78)",
    lineHeight: 1.6,
    maxWidth: 760,
    marginLeft: "auto",
    marginRight: "auto",
  },
  footer: {
    marginTop: 16,
    padding: 22,
    borderRadius: 24,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr repeat(3, minmax(0, 1fr))",
    gap: 18,
    textAlign: "left",
  },
  footerBrandBlock: {
    textAlign: "left",
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: "0.14em",
    color: "#d9d0ff",
    marginBottom: 10,
  },
  footerText: {
    color: "rgba(200,210,230,0.74)",
    lineHeight: 1.6,
    maxWidth: 360,
  },
  footerTitle: {
    color: "white",
    fontWeight: 900,
    marginBottom: 10,
  },
  footerLink: {
    color: "rgba(200,210,230,0.74)",
    marginBottom: 8,
    fontSize: 14,
  },
  footerBottom: {
    marginTop: 18,
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(200,210,230,0.68)",
    fontSize: 13,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
  },
  footerUser: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(230,235,245,0.9)",
  },
};
