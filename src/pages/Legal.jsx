import React, { useEffect } from "react";

const LAST_UPDATED = "September 2026";
const SITE_URL = "https://vydra-frontend-v2.vercel.app/legal";
const CONTACT_EMAIL = "vydra.contact@gmail.com";

function Section({ title, children }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      <div className="legal-content">{children}</div>
    </section>
  );
}

function setMetaTag(attribute, value, content) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export default function Legal() {
  useEffect(() => {
    const previousTitle = document.title;
    let canonical = document.head.querySelector('link[rel="canonical"]');

    document.title = "VYDRA Legal & Policy Center";

    setMetaTag(
      "name",
      "description",
      "Read VYDRA's Terms of Service, Privacy Policy, Acceptable Use Policy, Copyright Policy, Refund Policy, and other legal information."
    );

    setMetaTag("name", "robots", "index, follow");
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:title", "VYDRA Legal & Policy Center");
    setMetaTag(
      "property",
      "og:description",
      "Read VYDRA's Terms of Service, Privacy Policy, Acceptable Use Policy, Copyright Policy, Refund Policy, and other legal information."
    );
    setMetaTag("property", "og:url", SITE_URL);
    setMetaTag("property", "og:site_name", "VYDRA");

    setMetaTag("name", "twitter:card", "summary");
    setMetaTag("name", "twitter:title", "VYDRA Legal & Policy Center");
    setMetaTag(
      "name",
      "twitter:description",
      "Read VYDRA's Terms of Service, Privacy Policy, Acceptable Use Policy, Copyright Policy, Refund Policy, and other legal information."
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    const previousCanonical = canonical.getAttribute("href");
    canonical.setAttribute("href", SITE_URL);

    return () => {
      document.title = previousTitle;

      if (previousCanonical) {
        canonical.setAttribute("href", previousCanonical);
      } else {
        canonical.remove();
      }
    };
  }, []);

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1 className="legal-title">⚖️ VYDRA Legal & Policy Center</h1>
          <p className="legal-updated">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <Section title="Introduction">
          <p>
            VYDRA is an online software platform that helps users process,
            enhance, and download media from links supplied by users. This
            Legal & Policy Center brings together the Terms of Service,
            Privacy Policy, Acceptable Use Policy, Copyright / Takedown
            Policy, Refund Policy, Disclaimer, and contact information in one
            place for convenience.
          </p>

          <p>
            By accessing or using VYDRA, you acknowledge that you have read
            and understood the applicable policies on this page. Additional
            terms may apply to specific features, subscriptions, promotions,
            or third-party services.
          </p>
        </Section>

        <Section title="Terms of Service">
          <p>
            By using VYDRA, you agree to these terms and to comply with
            applicable laws and regulations. VYDRA provides processing and
            download functionality and does not claim ownership of content
            supplied by users.
          </p>

          <p>
            You are solely responsible for ensuring that you have the legal
            right, permission, license, or other lawful basis to access,
            process, reproduce, download, or otherwise use any content you
            submit to VYDRA.
          </p>

          <p>
            You must not use VYDRA in a manner that violates these policies,
            applicable law, third-party rights, or the terms of a platform
            from which content is accessed.
          </p>

          <p>
            VYDRA may update, modify, suspend, limit, or discontinue any part
            of the service, including individual features, at any time where
            permitted by law.
          </p>

          <p>
            VYDRA may suspend or terminate access where there is reasonable
            evidence of abuse, fraud, unlawful activity, security threats,
            attempts to bypass controls, or material violation of these
            terms.
          </p>
        </Section>

        <Section title="Privacy Policy">
          <p>
            VYDRA respects your privacy and aims to collect only information
            reasonably necessary to operate, secure, maintain, and improve the
            service.
          </p>

          <h3>1. Information We May Collect</h3>

          <p>
            Depending on how you use VYDRA, we may process the following
            categories of information:
          </p>

          <ul>
            <li>
              <strong>Account information:</strong> information associated
              with an account, such as an email address or user identifier.
            </li>
            <li>
              <strong>Usage information:</strong> information about downloads,
              feature usage, limits, account activity, and service
              interactions.
            </li>
            <li>
              <strong>Technical information:</strong> information such as IP
              address, browser or device information, operating system,
              timestamps, diagnostic information, and security-related logs.
            </li>
            <li>
              <strong>Transaction information:</strong> information relating
              to subscriptions or payments, such as plan type, transaction
              reference, amount, payment status, and related metadata.
            </li>
            <li>
              <strong>Content and URLs:</strong> links, media references, and
              other information that you voluntarily submit for processing.
            </li>
            <li>
              <strong>Support information:</strong> information you provide
              when contacting us for legal, technical, payment, copyright, or
              other support matters.
            </li>
          </ul>

          <h3>2. How We Use Information</h3>

          <p>
            We may use information to provide requested services, authenticate
            accounts, process transactions, enforce usage limits, prevent
            abuse and fraud, maintain security, troubleshoot errors, improve
            performance, respond to support requests, comply with legal
            obligations, and protect the rights and safety of VYDRA and its
            users.
          </p>

          <h3>3. Lawful Bases for Processing</h3>

          <p>
            Where applicable law requires a lawful basis for processing
            personal data, VYDRA may rely on one or more appropriate bases,
            including performance of a contract or requested service,
            compliance with legal obligations, consent where required, and
            legitimate interests such as security, fraud prevention, service
            improvement, and protection of the platform.
          </p>

          <h3>4. Cookies and Similar Technologies</h3>

          <p>
            VYDRA may use cookies, local storage, session technologies, and
            similar mechanisms where necessary to operate the website,
            maintain sessions, remember preferences, protect accounts, detect
            abuse, and understand service usage.
          </p>

          <p>
            Some cookies or similar technologies may be provided by third
            parties that support services used on VYDRA. Where consent is
            required by applicable law, we will seek the appropriate consent
            before using non-essential cookies or similar technologies.
          </p>

          <h3>5. Advertising and Personalized Advertising</h3>

          <p>
            VYDRA may introduce third-party advertising in the future to help
            support the service. When advertising is enabled, advertising
            providers may use cookies or similar technologies to deliver,
            measure, limit, or personalize advertisements, subject to their
            own policies and applicable law.
          </p>

          <p>
            If Google advertising services such as AdSense are used, Google
            and its advertising partners may use cookies or similar
            technologies in connection with advertising. Users may be able to
            control personalized advertising through available advertising
            settings provided by the relevant provider.
          </p>

          <p>
            For example, Google provides advertising controls through its Ads
            Settings service:
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}Google Ads Settings
            </a>
            .
          </p>

          <p>
            Advertising practices and consent requirements may differ by
            country or region. For visitors in jurisdictions that require
            consent for personalized advertising or related technologies,
            VYDRA may use a consent mechanism before enabling those
            technologies.
          </p>

          <h3>6. Third-Party Service Providers</h3>

          <p>
            VYDRA may rely on third-party providers for services such as
            authentication, database hosting, payment processing, cloud
            infrastructure, file storage, security, analytics, communications,
            and technical support.
          </p>

          <p>
            These providers may process information on our behalf or as
            independent service providers according to their applicable
            agreements and privacy policies. We do not authorize service
            providers to use personal data for purposes unrelated to the
            services they provide except where otherwise permitted by law.
          </p>

          <h3>7. Payments</h3>

          <p>
            Payments may be processed through third-party payment providers.
            VYDRA may receive transaction-related information such as payment
            status, transaction references, subscription details, and related
            metadata.
          </p>

          <p>
            Payment card and other payment credentials are handled by the
            applicable payment processor according to its own security and
            privacy practices. VYDRA does not intend to store full payment
            card numbers or card security codes on its own systems.
          </p>

          <h3>8. Data Sharing</h3>

          <p>
            VYDRA does not sell personal data as a business commodity.
            Information may nevertheless be disclosed to service providers,
            payment processors, advertising partners, legal advisers,
            authorities, or other parties where reasonably necessary to
            operate the service, process transactions, protect users and
            systems, investigate abuse, enforce policies, or comply with
            applicable law.
          </p>

          <p>
            Where legally required, we may disclose information in response
            to lawful requests, court orders, regulatory requirements, or
            other valid legal processes.
          </p>

          <h3>9. Data Retention</h3>

          <p>
            We retain information only for as long as reasonably necessary for
            the purposes described in this policy, including providing the
            service, maintaining security, resolving disputes, enforcing
            agreements, meeting legal obligations, and keeping appropriate
            business records.
          </p>

          <p>
            Retention periods may differ depending on the type of information,
            the reason it was collected, and applicable legal requirements.
          </p>

          <h3>10. Data Security</h3>

          <p>
            VYDRA uses reasonable technical and organizational measures
            intended to protect information against unauthorized access,
            misuse, alteration, disclosure, or destruction.
          </p>

          <p>
            No internet service can guarantee absolute security. Users should
            protect their account credentials and avoid submitting information
            to VYDRA that they do not have the right or need to share.
          </p>

          <h3>11. International Processing</h3>

          <p>
            Depending on the infrastructure and third-party providers used,
            information may be processed or stored in countries other than
            Nigeria.
          </p>

          <p>
            Where required by applicable law, VYDRA will seek to use
            appropriate safeguards for international data transfers and
            third-party processing.
          </p>

          <h3>12. Your Privacy Rights</h3>

          <p>
            Depending on your location and applicable law, you may have rights
            relating to your personal data, which may include the right to
            request access to personal data, correction of inaccurate
            information, deletion, restriction or objection to certain
            processing, withdrawal of consent where processing is based on
            consent, and other rights provided by law.
          </p>

          <p>
            To submit a privacy request, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            We may need to verify your identity before completing a request.
          </p>

          <h3>13. Complaints</h3>

          <p>
            If you have a privacy concern, please contact VYDRA first so that
            we can review and attempt to resolve the issue.
          </p>

          <p>
            Where applicable under Nigerian data-protection law, individuals
            may also have the right to lodge a complaint with the Nigeria Data
            Protection Commission.
          </p>

          <h3>14. Account and Data Requests</h3>

          <p>
            Where supported by the service and applicable law, you may request
            assistance with account-related or personal-data matters by
            contacting{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h3>15. Changes to This Privacy Policy</h3>

          <p>
            We may update this Privacy Policy when our services, technologies,
            legal obligations, or data-processing practices change. The
            "Last updated" date at the top of this page indicates when the
            current version was published.
          </p>
        </Section>

        <Section title="Acceptable Use Policy">
          <p>
            You agree not to use VYDRA for unlawful activity, fraud,
            harassment, malware distribution, spam, unauthorized access,
            destructive scraping, abuse of third-party systems, or any other
            activity that violates applicable law or causes harm to users,
            service providers, or third parties.
          </p>

          <p>
            You must not use VYDRA to upload, process, distribute, or download
            content where doing so would violate copyright, privacy,
            intellectual-property, contractual, or other legal rights.
          </p>

          <p>
            Automated abuse, excessive request flooding, attempts to overload
            infrastructure, reverse engineering of protected systems, bypass
            attempts, credential abuse, or attempts to defeat usage limits or
            access controls may result in immediate restriction or
            termination.
          </p>
        </Section>

        <Section title="Copyright / Takedown Policy">
          <p>
            VYDRA respects copyright and other intellectual-property rights.
            VYDRA does not claim ownership of content submitted by users, and
            users remain responsible for determining whether their intended
            use of content is lawful.
          </p>

          <p>
            If you believe material associated with VYDRA infringes your
            copyright or other rights, send a notice to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <p>
            A useful notice should identify the copyrighted work or right at
            issue, identify the material in question with enough detail for us
            to investigate, provide your contact information, explain the
            basis of your claim, and include a statement that the information
            supplied is accurate to the best of your knowledge.
          </p>

          <p>
            We may request additional information where reasonably necessary
            to evaluate a complaint and may restrict or remove access to
            material where required by applicable law or appropriate under our
            policies.
          </p>
        </Section>

        <Section title="Refund Policy">
          <p>
            Payments for digital services, subscriptions, or premium features
            are generally non-refundable except where required by applicable
            law or where VYDRA otherwise approves a refund after reviewing a
            verified issue.
          </p>

          <p>
            Refund requests should be sent to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the
            transaction reference, account email where applicable, and a
            description of the issue.
          </p>

          <p>
            Refund decisions may depend on the transaction status, service
            usage, technical circumstances, and applicable law.
          </p>
        </Section>

        <Section title="Age Restriction">
          <p>
            VYDRA is intended for users who are at least 13 years old, or
            older where a higher minimum age is required by local law.
          </p>

          <p>
            VYDRA is not intended to knowingly collect personal information
            from children who are below the applicable minimum age without a
            lawful basis or required authorization.
          </p>

          <p>
            If you believe a child has provided personal information in a way
            that violates applicable requirements, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="Disclaimer">
          <p>
            VYDRA is provided "as is" and "as available" to the maximum extent
            permitted by applicable law. We do not guarantee uninterrupted
            availability, error-free operation, complete accuracy, or that
            every requested URL, platform, format, or download will always be
            supported.
          </p>

          <p>
            Third-party websites and platforms may change their technical
            systems, access rules, content policies, authentication methods,
            or availability without notice. Such changes may affect VYDRA's
            ability to process or retrieve content.
          </p>

          <p>
            Users are responsible for verifying that their use of downloaded
            or processed material complies with applicable copyright,
            licensing, privacy, contractual, and platform-specific rules.
          </p>

          <p>
            To the maximum extent permitted by law, VYDRA is not responsible
            for losses arising from service interruptions, third-party
            restrictions, unlawful user activity, content-related disputes,
            or misuse of the service.
          </p>
        </Section>

        <Section title="Contact & Compliance">
          <p>
            For legal, copyright, privacy, payment, security, or compliance
            inquiries, contact:
          </p>

          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>

          <p>
            We may ask for additional information where necessary to verify
            ownership of an account, evaluate a legal request, investigate a
            copyright complaint, or address a security issue.
          </p>
        </Section>

        <Section title="Governing Law">
          <p>
            These terms are governed by the laws of the Federal Republic of
            Nigeria, except to the extent that applicable mandatory law
            requires otherwise.
          </p>

          <p>
            Any dispute that cannot be resolved informally may be brought
            before a court of competent jurisdiction in Nigeria, subject to
            applicable law and any mandatory rights a user may have under the
            laws of their jurisdiction.
          </p>
        </Section>

        <footer className="legal-footer">
          © {new Date().getFullYear()} VYDRA. All rights reserved.
        </footer>
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

        .legal-content h3 {
          margin: 22px 0 10px;
          font-size: 16px;
          color: #9eeeff;
        }

        .legal-content p {
          margin: 0 0 12px 0;
          color: rgba(230,235,245,0.9);
          line-height: 1.75;
          font-size: 14.5px;
        }

        .legal-content ul {
          margin: 8px 0 16px 20px;
          padding: 0;
          color: rgba(230,235,245,0.9);
        }

        .legal-content li {
          margin-bottom: 9px;
          line-height: 1.65;
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
          .legal-page {
            padding: 30px 14px 60px;
          }

          .legal-container {
            padding: 20px;
            border-radius: 16px;
          }

          .legal-title {
            font-size: 26px;
          }

          .legal-section {
            padding: 16px;
          }

          .legal-content p,
          .legal-content li {
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}