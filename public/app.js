"use strict";

const documents = [
  {
    id: "requirements",
    title: "Product requirements",
    path: "../requirements.md",
    description: "Scope, functional requirements and acceptance criteria",
  },
  {
    id: "assumptions",
    title: "Assumptions & limitations",
    path: "../docs/assumptions-and-limitations.md",
    description: "Decisions, boundaries and known risks",
  },
  {
    id: "traceability",
    title: "Traceability matrix",
    path: "../docs/traceability-matrix.md",
    description: "Requirements mapped to planned verification",
  },
  {
    id: "security",
    title: "Security baseline",
    path: "../docs/security-baseline.md",
    description: "Repository hygiene and recorded scan evidence",
  },
  {
    id: "ci",
    title: "CI workflow",
    path: "../.github/workflows/ci.yml",
    description: "Automated testing workflow",
    raw: true,
  },
];

const content = document.querySelector("#document-content");
const navigation = document.querySelector("#document-navigation");
const status = document.querySelector("#document-status");

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderNavigation() {
  navigation.replaceChildren();

  for (const doc of documents) {
    const button = makeElement("button", "doc-nav-item", doc.title);
    button.type = "button";
    button.dataset.document = doc.id;
    button.addEventListener("click", () => openDocument(doc.id));
    navigation.append(button);
  }
}

function renderMarkdown(markdown) {
  const fragment = document.createDocumentFragment();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph = [];
  let list = null;
  let codeLines = null;
  let codeLanguage = "";

  function flushParagraph() {
    if (!paragraph.length) return;
    fragment.append(makeElement("p", "", paragraph.join(" ")));
    paragraph = [];
  }

  function flushList() {
    if (!list) return;
    fragment.append(list);
    list = null;
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();

      if (codeLines) {
        const pre = makeElement("pre");
        const code = makeElement("code", codeLanguage, codeLines.join("\n"));
        pre.append(code);
        fragment.append(pre);
        codeLines = null;
        codeLanguage = "";
      } else {
        codeLines = [];
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (codeLines) {
      codeLines.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      fragment.append(
        makeElement(`h${heading[1].length + 1}`, "", heading[2]),
      );
      continue;
    }

    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      if (!list) list = makeElement("ul");
      list.append(makeElement("li", "", listItem[1]));
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushParagraph();
      flushList();
      fragment.append(makeElement("p", "table-note", line.trim()));
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();

  if (codeLines) {
    const pre = makeElement("pre");
    pre.append(makeElement("code", codeLanguage, codeLines.join("\n")));
    fragment.append(pre);
  }

  return fragment;
}

async function openDocument(id) {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return;

  navigation.querySelectorAll("button").forEach((button) => {
    const selected = button.dataset.document === id;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-current", selected ? "page" : "false");
  });

  content.replaceChildren(makeElement("p", "", "Loading document…"));
  status.textContent = `Loading ${doc.title}`;

  try {
    const response = await fetch(doc.path);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    content.replaceChildren();

    content.append(makeElement("p", "eyebrow", "PROJECT DOCUMENT"));
    content.append(makeElement("h2", "", doc.title));
    content.append(makeElement("p", "document-description", doc.description));

    if (doc.raw) {
      const pre = makeElement("pre");
      pre.append(makeElement("code", "language-yaml", text));
      content.append(pre);
    } else {
      content.append(renderMarkdown(text));
    }

    status.textContent = `${doc.title} loaded from the published source file.`;
    history.replaceState(null, "", `#documents/${id}`);
  } catch (error) {
    content.replaceChildren(
      makeElement("h2", "", "Unable to load this document"),
      makeElement(
        "p",
        "",
        `The source could not be loaded (${error.message}). Please try again or open the source repository.`,
      ),
      makeElement("a", "", "Open source repository"),
    );

    const link = content.querySelector("a");
    link.href = "https://github.com/scrumster/ai-assisted-delivery-demo";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    status.textContent = "Document loading failed.";
  }
}

renderNavigation();

const requestedId = window.location.hash.startsWith("#documents/")
  ? window.location.hash.slice("#documents/".length)
  : "requirements";

openDocument(requestedId);