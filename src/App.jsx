import { Outlet, useLocation } from "react-router-dom";
import React, { useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import SEO from "./components/SEO";

import { useAuth } from "./context/AuthContext";

const SITE_ORIGIN = "https://vydra-frontend-v2.vercel.app";
const OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

function getSeoConfig(pathname) {
if (pathname === "/") {
return {
title: "VYDRA - Download Videos from Any Platform",
description:
"VYDRA lets you download videos from TikTok, YouTube, Instagram, Facebook, X, and Vimeo with a fast, simple online downloader.",
canonical: `${SITE_ORIGIN}/`,
index: true,
schema: {
"@context": "https://schema.org",
"@type": "WebApplication",
name: "VYDRA",
url: `${SITE_ORIGIN}/`,
description:
"VYDRA is an online video downloader for downloading videos from supported social and video platforms.",
applicationCategory: "MultimediaApplication",
operatingSystem: "Web",
offers: {
"@type": "Offer",
price: "0",
priceCurrency: "USD",
},
},
};
}

if (pathname === "/download") {
return {
title: "VYDRA Video Downloader - Download Videos Online",
description:
"Download videos from YouTube, TikTok, Instagram, Facebook, Vimeo, and X with VYDRA. Paste a link, choose your quality, and download.",
canonical: `${SITE_ORIGIN}/download`,
index: true,
schema: {
"@context": "https://schema.org",
"@type": "WebPage",
name: "VYDRA Video Downloader",
url: `${SITE_ORIGIN}/download`,
description:
"Download videos from YouTube, TikTok, Instagram, Facebook, Vimeo, and X with VYDRA.",
isPartOf: {
"@type": "WebSite",
name: "VYDRA",
url: `${SITE_ORIGIN}/`,
},
},
};
}

if (pathname === "/premium") {
return {
title: "VYDRA Premium - More Downloads, AI Studio & Priority Access",
description:
"Upgrade VYDRA for higher daily download limits, AI Studio access, priority support, and faster download queue access.",
canonical: `${SITE_ORIGIN}/premium`,
index: true,
schema: {
"@context": "https://schema.org",
"@type": "WebPage",
name: "VYDRA Premium",
url: `${SITE_ORIGIN}/premium`,
description:
"VYDRA Premium provides higher download limits, AI Studio access, priority support, and faster queue access.",
isPartOf: {
"@type": "WebSite",
name: "VYDRA",
url: `${SITE_ORIGIN}/`,
},
},
};
}

if (pathname === "/ai-studio") {
return {
title: "VYDRA AI Studio - Thumbnails, Captions & Hashtags",
description:
"Use VYDRA AI Studio to create thumbnails, captions, and hashtags from your latest downloaded video. Premium feature.",
canonical: `${SITE_ORIGIN}/ai-studio`,
index: true,
schema: {
"@context": "https://schema.org",
"@type": "WebPage",
name: "VYDRA AI Studio",
url: `${SITE_ORIGIN}/ai-studio`,
description:
"VYDRA AI Studio provides thumbnail, caption, and hashtag tools for downloaded videos.",
isPartOf: {
"@type": "WebSite",
name: "VYDRA",
url: `${SITE_ORIGIN}/`,
},
},
};
}

if (pathname === "/legal") {
return {
title: "VYDRA Legal & Policy Center",
description:
"Read VYDRA's Terms of Service, Privacy Policy, Acceptable Use Policy, Copyright Policy, Refund Policy, and other legal information.",
canonical: `${SITE_ORIGIN}/legal`,
index: true,
schema: {
"@context": "https://schema.org",
"@type": "WebPage",
name: "VYDRA Legal & Policy Center",
url: `${SITE_ORIGIN}/legal`,
description:
"VYDRA's legal, privacy, copyright, refund, and policy information.",
isPartOf: {
"@type": "WebSite",
name: "VYDRA",
url: `${SITE_ORIGIN}/`,
},
},
};
}

if (
pathname === "/login" ||
pathname === "/invite" ||
pathname.startsWith("/invite/")
) {
return {
title: "VYDRA",
description: "VYDRA account and invitation page.",
canonical: null,
index: false,
schema: null,
};
}

return {
title: "VYDRA",
description: "VYDRA is an online video downloader and creator toolkit.",
canonical: null,
index: false,
schema: null,
};
}

export default function App() {
const { user, signOut } = useAuth();
const [loginOpen, setLoginOpen] = useState(false);
const location = useLocation();

const seo = getSeoConfig(location.pathname);

return (
<> <SEO
     title={seo.title}
     description={seo.description}
     canonical={seo.canonical}
     index={seo.index}
     ogImage={OG_IMAGE}
     schema={seo.schema}
   />

  {/* 🔥 Background System (stable + layered) */}
  <div className="vydra-bg" aria-hidden="true">
    <div className="vydra-bg__base" />
    <div className="vydra-bg__aurora" />
    <div className="vydra-bg__ripple" />
    <div className="vydra-bg__stars" />
    <div className="vydra-bg__noise" />
  </div>

  {/* 🔥 App Layer */}
  <div className="vydra-app">
    <Header
      user={user}
      onOpenLogin={() => setLoginOpen(true)}
      onLogout={signOut}
    />

    <main className="vydra-main" role="main">
      <Outlet />
    </main>

    <Footer />
  </div>

  {/* 🔥 Modal Layer */}
  <LoginModal
    open={loginOpen}
    onClose={() => setLoginOpen(false)}
    onLoginSuccess={() => setLoginOpen(false)}
  />
</>

);
}
