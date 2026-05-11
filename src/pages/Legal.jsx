import React from "react";

const LAST_UPDATED = "April 2026";

function Section({ title, children }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      <div className="legal-content">{children}</div>
    </section>
  );
}

export default function Legal() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1 className="legal-title">
            ⚖️ VYDRA Legal & Policy Center
          </h1>
          <p className="legal-updated">Last updated: {LAST_UPDATED}</p>
        </header>

        <Section title="Introduction">
          <p>
            VYDRA provides a software platform that helps users process, enhance, and download media from links
            supplied by users. This page brings together the Terms of Service, Privacy Policy, Acceptable Use Policy,
            DMCA / Copyright Policy, Disclaimer, and Contact information in one place for convenience.
          </p>
        </Section>

        <Section title="Terms of Service">
          <p>
            By using VYDRA, you agree to these terms. VYDRA is a processing tool and does not claim ownership of user
            supplied content. Users are solely responsible for ensuring they have the right to access, process, or
            download any content they submit. VYDRA may suspend, restrict, or terminate access at any time if these
            terms are violated.
          </p>
          <p>
            VYDRA may update, modify, suspend, or discontinue any feature or part of the service at any time, with or
            without notice, where permitted by law.
          </p>
        </Section>

        <Section title="Privacy Policy">
          <p>
            We collect limited information needed to operate the platform, such as account details, usage metrics,
            payment metadata, and technical information. We do not sell personal data. Payment processing is handled by
            third-party providers, and their privacy practices apply to payment interactions.
          </p>
          <p>
            We may use usage data to enforce limits, prevent abuse, improve performance, and protect the service.
          </p>
        </Section>

        <Section title="Acceptable Use Policy">
          <p>
            You agree not to use VYDRA for illegal activity, abuse, harassment, malware distribution, account fraud,
            spam, scraping that damages the service, pornography, or any other activity that violates applicable law or
            harms other users.
          </p>
          <p>
            Automated abuse, excessive request flooding, reverse engineering attempts against protected systems, or
            attempts to bypass limits and access controls may result in immediate restriction or termination.
          </p>
        </Section>

        <Section title="DMCA / Copyright Policy">
          <p>
            VYDRA respects copyright and intellectual property rights. If you believe content processed through VYDRA
            infringes your rights, send a takedown notice to{" "}
            <a href="mailto:vydra.contact@gmail.com">vydra.contact@gmail.com</a>.
          </p>
          <p>
            Please include identification of the copyrighted work, identification of the allegedly infringing material,
            your contact information, a statement of good faith belief, and a statement that the information is
            accurate.
          </p>
        </Section>

        <Section title="Refund Policy">
          <p>
            Payments are generally non-refundable except where required by applicable law or where a refund is
            otherwise granted at our discretion after review of a verified issue.
          </p>
        </Section>

        <Section title="Age Restriction">
          <p>
            VYDRA is intended for users who are at least 13 years old, or older where required by local law. If you are
            not old enough to use the service in your jurisdiction, you must not use it.
          </p>
        </Section>

        <Section title="Disclaimer">
          <p>
            VYDRA is provided “as is” and “as available” without warranties of any kind. We do not guarantee
            uninterrupted service, error-free operation, or that results will always be accurate or available.
          </p>
          <p>
            To the maximum extent allowed by law, VYDRA is not liable for losses arising from service interruptions,
            user misuse, third-party platform restrictions, or content-related disputes.
          </p>
        </Section>

        <Section title="Contact & Compliance">
          <p>
            For legal, copyright, privacy, or compliance inquiries, contact{" "}
            <a href="mailto:vydra.contact@gmail.com">vydra.contact@gmail.com</a>.
          </p>
        </Section>

        <Section title="Governing Law">
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria. Any dispute that cannot be
            resolved informally may be brought before the appropriate courts in Nigeria, unless another outcome is
            required by law.
          </p>
        </Section>

        <footer className="legal-footer">© 2026 VYDRA. All rights reserved.</footer>
      </div>

      <style>{`
        .legal-page {
          min-height: 100vh;
          padding: 50px 20px 80px;
          color: white;
        }

        .legal-container {
          max-width: 1000px;
          margin: 0 auto;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 30px;
          backdrop-filter: blur(18px);
          box-shadow: 0 25px 80px rgba(0,0,0,0.6);
        }

        .legal-header {
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 16px;
        }

        .legal-title {
          margin: 0;
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(90deg, #00ffff, #7fdcff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .legal-updated {
          margin: 10px 0 0 0;
          color: rgba(200,210,230,0.7);
          font-size: 13px;
        }

        .legal-section {
          margin-top: 20px;
          padding: 20px;
          border-radius: 16px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s ease;
        }

        .legal-section:hover {
          border-color: rgba(0,255,255,0.25);
          box-shadow: 0 0 20px rgba(0,255,255,0.08);
        }

        .legal-section h2 {
          margin: 0 0 12px 0;
          font-size: 19px;
          color: #00ffff;
        }

        .legal-content p {
          margin: 0 0 12px 0;
          color: rgba(230,235,245,0.9);
          line-height: 1.75;
          font-size: 14.5px;
        }

        .legal-content p:last-child {
          margin-bottom: 0;
        }

        .legal-content a {
          color: #00ffff;
          font-weight: 700;
          text-decoration: none;
        }

        .legal-content a:hover {
          text-decoration: underline;
        }

        .legal-footer {
          margin-top: 28px;
          color: rgba(200,210,230,0.6);
          font-size: 13px;
          text-align: center;
        }

        @media (max-width: 700px) {
          .legal-container {
            padding: 20px;
          }

          .legal-title {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  );
}