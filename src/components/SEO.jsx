import { useEffect } from "react";

const SITE_ORIGIN = "https://vydra-frontend-v2.vercel.app";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-image.png`;

function upsertMeta(attribute, value, content) {
const selector = `meta[${attribute}="${value}"]`;
let element = document.head.querySelector(selector);
let created = false;
let previousContent = null;

if (!element) {
element = document.createElement("meta");
element.setAttribute(attribute, value);
document.head.appendChild(element);
created = true;
} else {
previousContent = element.getAttribute("content");
}

element.setAttribute("content", content);

return {
element,
created,
previousContent,
};
}

function upsertCanonical(href) {
let element = document.head.querySelector('link[rel="canonical"]');
let created = false;
let previousHref = null;

if (!element) {
element = document.createElement("link");
element.setAttribute("rel", "canonical");
document.head.appendChild(element);
created = true;
} else {
previousHref = element.getAttribute("href");
}

element.setAttribute("href", href);

return {
element,
created,
previousHref,
};
}

function upsertJsonLd(data) {
let element = document.head.querySelector("#vydra-page-jsonld");
let created = false;
let previousText = null;

if (!element) {
element = document.createElement("script");
element.id = "vydra-page-jsonld";
element.type = "application/ld+json";
document.head.appendChild(element);
created = true;
} else {
previousText = element.textContent;
}

element.textContent = JSON.stringify(data);

return {
element,
created,
previousText,
};
}

export default function SEO({
title,
description,
canonical,
index = true,
ogImage = DEFAULT_IMAGE,
ogType = "website",
schema = null,
}) {
useEffect(() => {
const previousTitle = document.title;

document.title = title;

const touchedMeta = [
  upsertMeta("name", "description", description),
  upsertMeta(
    "name",
    "robots",
    index ? "index, follow, max-image-preview:large" : "noindex, follow"
  ),
  upsertMeta("property", "og:type", ogType),
  upsertMeta("property", "og:title", title),
  upsertMeta("property", "og:description", description),
  upsertMeta("property", "og:url", canonical || `${SITE_ORIGIN}/`),
  upsertMeta("property", "og:site_name", "VYDRA"),
  upsertMeta("property", "og:image", ogImage),
  upsertMeta(
    "property",
    "og:image:alt",
    `${title} - VYDRA`
  ),
  upsertMeta("name", "twitter:card", "summary_large_image"),
  upsertMeta("name", "twitter:title", title),
  upsertMeta("name", "twitter:description", description),
  upsertMeta("name", "twitter:image", ogImage),
];

const canonicalState = canonical
  ? upsertCanonical(canonical)
  : null;

const jsonLdState = schema ? upsertJsonLd(schema) : null;

return () => {
  document.title = previousTitle;

  for (const item of touchedMeta) {
    if (item.created) {
      item.element.remove();
    } else if (item.previousContent !== null) {
      item.element.setAttribute("content", item.previousContent);
    }
  }

  if (canonicalState) {
    if (canonicalState.created) {
      canonicalState.element.remove();
    } else if (canonicalState.previousHref !== null) {
      canonicalState.element.setAttribute(
        "href",
        canonicalState.previousHref
      );
    }
  }

  if (jsonLdState) {
    if (jsonLdState.created) {
      jsonLdState.element.remove();
    } else {
      jsonLdState.element.textContent =
        jsonLdState.previousText || "";
    }
  }
};

}, [
title,
description,
canonical,
index,
ogImage,
ogType,
schema,
]);

return null;
}
