import type { ResumeData, PdfConfig } from "./types";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9\u00C0-\u024F\s._-]+/gi, "_").trim() || "resume";
}

function contactLine(contact: ResumeData["contact"], cfg: PdfConfig) {
  const parts: any[] = [];
  const pushSep = () => {
    if (parts.length) parts.push({ text: "  •  " });
  };

  if (contact.phone) {
    parts.push({ text: contact.phone });
  }
  if (contact.email) {
    pushSep();
    if (cfg.asLinks.email)
      parts.push({ text: contact.email, link: `mailto:${contact.email}` });
    else parts.push({ text: contact.email });
  }
  if (contact.website) {
    pushSep();
    if (cfg.asLinks.website)
      parts.push({ text: contact.website, link: contact.website });
    else parts.push({ text: contact.website });
  }
  if (contact.linkedin) {
    pushSep();
    if (cfg.asLinks.linkedin)
      parts.push({ text: contact.linkedin, link: contact.linkedin });
    else parts.push({ text: contact.linkedin });
  }
  if (contact.location) {
    pushSep();
    parts.push({ text: contact.location });
  }
  return parts;
}

function sectionHeader(title: string) {
  return [
    {
      text: title.toUpperCase(),
      style: "sectionHeader",
      margin: [0, 14, 0, 4],
    },
    {
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1 }],
      margin: [0, 0, 0, 6],
    },
  ];
}

function lineItem(left: string, right?: string) {
  return {
    columns: [
      { text: left, width: "*", bold: true },
      { text: right || "", width: "auto", alignment: "right" },
    ],
    margin: [0, 2, 0, 2],
  };
}

function bullets(text?: string) {
  if (!text) return undefined;
  const items = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!items.length) return undefined;
  return { ul: items, margin: [0, 2, 0, 2] };
}

function normalizeUrl(raw: string) {
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }

export function buildDocDefinition(data: ResumeData, cfg: PdfConfig) {
  const content: any[] = [];

  // Header: Name + Headline + contacts
  content.push({ text: data.contact.fullName || "Unnamed", style: "name" });
  if (data.contact.headline) {
    content.push({ text: data.contact.headline, margin: [0, 2, 0, 6] });
  }
  content.push({ columns: [{ text: contactLine(data.contact, cfg) }] });

  // Education
  if (data.education?.length) {
    content.push(...sectionHeader("Education"));
    data.education.forEach((ed) => {
      content.push(
        lineItem(
          `${ed.school}${ed.location ? " — " + ed.location : ""}`,
          [ed.startDate, ed.endDate].filter(Boolean).join(" – ")
        )
      );
      if (ed.degree) content.push({ text: ed.degree });
      if (ed.notes) content.push({ text: ed.notes });
    });
  }

  // Experience
  if (data.experience?.length) {
    content.push(...sectionHeader("Experience"));
    data.experience.forEach((ex) => {
      content.push(
        lineItem(
          `${ex.title || ""}${ex.title && ex.company ? " — " : ""}${
            ex.company
          }${ex.location ? " — " + ex.location : ""}`,
          [ex.startDate, ex.endDate].filter(Boolean).join(" – ")
        )
      );
      const b = bullets(ex.bullets);
      if (b) content.push(b);
    });
  }

  

  // Projects
  if (data.projects?.length) {
    content.push(...sectionHeader("Projects"));
    data.projects.forEach((p) => {
      const href = normalizeUrl(p.url as string);
      content.push(
        {
          text: [{ text: p.name, bold: true}, { text: " — " }, { text: href, link: href }],
        }
      );
      const b = bullets(p.description);
      if (b) content.push(b);
    });
  }

  // Skills
  if (data.skills) {
    content.push(...sectionHeader("Skills"));
    const arr = data.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) {
      content.push(bullets(data.skills));
    } else {
      content.push(bullets(data.skills));
    }
  }

  const docDefinition = {
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { fontSize: cfg.fontSize },
    content,
    styles: {
      name: { fontSize: Math.max(cfg.fontSize + 5, 12), bold: true },
      sectionHeader: { fontSize: Math.max(cfg.fontSize - 0.5, 9), bold: true },
    },
  };
  return docDefinition;
}

export async function exportPdf(data: ResumeData | null, cfg: PdfConfig) {
  if (!data) throw new Error("No compiled snapshot found.");

  const pdfMakeModule: any =
    (await import("pdfmake/build/pdfmake")).default ||
    (await import("pdfmake/build/pdfmake"));
  // vfs fonts sometimes export as pdfFonts.pdfMake.vfs or as { vfs }
  const pdfFontsModule: any =
    (await import("pdfmake/build/vfs_fonts")).default ||
    (await import("pdfmake/build/vfs_fonts"));

  const pdfMake: any = pdfMakeModule.default ?? pdfMakeModule;
  const pdfFonts: any = pdfFontsModule.default ?? pdfFontsModule;

  const vfsCandidate = pdfFonts?.pdfMake?.vfs ?? pdfFonts?.vfs;
  if (vfsCandidate) {
    pdfMake.vfs = vfsCandidate;
  }

  const dd = buildDocDefinition(data, cfg);
  const filename =
    sanitizeFilename((data.contact.fullName || "resume") + "_CV") + ".pdf";
  pdfMake.createPdf(dd).download(filename);
}
