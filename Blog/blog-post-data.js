/*
  ONE DATA FILE FOR EVERY BLOG POST
  ---------------------------------
  Add each new post to `posts`, then add its ID to `order`.
  The shared page is opened with:

  blog-post.html?post=POST-ID
*/

window.ZG_BLOG = {
  order: [
    "open-archive",
    "reading-the-works",
    "private-collections",
    "verifying-materials",
    "oral-testimony",
    "building-chronology",
    "development-update",
  ],

  posts: {
    "open-archive": {
      id: "open-archive",
      category: "Editorial",
      date: "2026-08-03",
      displayDate: "03.08.2026",
      title: "Why a Digital Museum Must Remain Open to New Evidence",
      deck:
        "A historical archive is not completed when it first appears online. Its value grows through correction, transparent sourcing, new testimony and responsible public participation.",
      author: "Digital Museum Editorial Team",
      heroLabel: "Living Archive",
      heroNumber: "01",
      editorialNote:
        "This sample article demonstrates the reusable post structure. Replace or expand its text through blog-post-data.js without creating another HTML page.",
      blocks: [
        {
          type: "lead",
          text:
            "A digital museum should not present history as a sealed room. It should offer a carefully organized record while remaining capable of receiving new documents, correcting mistakes and showing readers how conclusions were reached.",
        },
        {
          type: "heading",
          level: 2,
          id: "archive-not-monument",
          text: "An Archive Is Not a Monument",
        },
        {
          type: "paragraph",
          text:
            "A monument usually communicates a finished public message. An archive performs a different task. It preserves traces, records uncertainty and allows apparently minor materials to acquire meaning when they are compared with other evidence.",
        },
        {
          type: "paragraph",
          text:
            "For that reason, the Digital Museum should distinguish between a verified fact, an attributed recollection, an editorial interpretation and a question that remains unresolved. These categories may sit beside one another, but they should not be silently merged.",
        },
        {
          type: "quote",
          text:
            "The strength of a digital archive lies not in pretending to be complete, but in making its incompleteness visible and researchable.",
          cite: "Digital Museum editorial principle",
        },
        {
          type: "heading",
          level: 2,
          id: "what-new-evidence-changes",
          text: "What New Evidence Can Change",
        },
        {
          type: "paragraph",
          text:
            "A newly located letter may clarify chronology. A photograph may identify participants in an event. A recording may preserve a voice that written summaries flattened. A correction from a reader may reveal that a date, place or attribution was carried forward incorrectly from an earlier source.",
        },
        {
          type: "list",
          ordered: false,
          items: [
            "Dates and sequences of events can be refined.",
            "Authorship and provenance can be corrected.",
            "Previously private material can enter the public record with permission.",
            "Conflicting testimonies can be displayed with clear attribution.",
            "Translations and transcriptions can be improved.",
          ],
        },
        {
          type: "heading",
          level: 2,
          id: "openness-without-carelessness",
          text: "Openness Without Carelessness",
        },
        {
          type: "paragraph",
          text:
            "An open archive is not an unmoderated archive. Every proposed addition should be examined for provenance, relevance, rights, privacy and historical context. Where verification is incomplete, the record should say so plainly rather than presenting uncertainty as confidence.",
        },
        {
          type: "note",
          title: "Practical rule",
          text:
            "The museum may publish uncertainty, but it should label uncertainty. It may present disagreement, but it should identify who is making each claim and what evidence supports it.",
        },
        {
          type: "heading",
          level: 2,
          id: "reader-participation",
          text: "Readers as Participants",
        },
        {
          type: "paragraph",
          text:
            "Readers may hold documents, photographs, recordings or memories that are absent from institutional collections. The contribution process therefore belongs to the museum’s research method, not merely to its publicity. A responsible submission system records the contributor, preserves the original context and separates ownership from permission to reproduce.",
        },
        {
          type: "paragraph",
          text:
            "The result is a museum that can grow without losing its structure: a public resource that is stable enough to cite, but open enough to learn.",
        },
      ],
      sources: [
        {
          label: "Digital Museum Editorial Policy",
          href: "../policies.html#editorial-policy",
          note: "Project standards for evidence, attribution, corrections and contributed material.",
        },
        {
          label: "Digital Museum Archive",
          href: "../archive.html",
          note: "Catalogue structure and access framework for archival records.",
        },
        {
          label: "Contact and Contribution Page",
          href: "../contact.html",
          note: "Submission route for documents, corrections and research collaboration.",
        },
      ],
      related: ["private-collections", "verifying-materials", "development-update"],
    },

    "reading-the-works": {
      id: "reading-the-works",
      category: "Research",
      date: "2026-07-28",
      displayDate: "28.07.2026",
      title: "Reading the Works: Notes Toward a Research Method",
      deck:
        "A practical framework for connecting published works, manuscripts, historical context and later interpretation.",
      author: "Research Desk",
      heroLabel: "Research Method",
      heroNumber: "02",
      blocks: [
        {
          type: "lead",
          text:
            "A work should be read as a text, as an object with a publication history and as part of a wider intellectual biography. None of those perspectives is sufficient alone.",
        },
        {
          type: "heading",
          level: 2,
          id: "begin-with-edition",
          text: "Begin With the Edition",
        },
        {
          type: "paragraph",
          text:
            "Research should record which edition is being used, when and where it was published, which language it appears in and whether later editions altered the text, title, introduction or notes.",
        },
        {
          type: "heading",
          level: 2,
          id: "separate-text-context",
          text: "Separate Text From Context",
        },
        {
          type: "paragraph",
          text:
            "Historical context can illuminate a text, but it should not replace close reading. The first task is to identify the work’s own concepts, structure, references and claims before asking how later political or biographical events changed its reception.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Identify the exact edition and language.",
            "Describe the work’s internal structure.",
            "Trace cited authors, traditions and terminology.",
            "Compare manuscripts or later editions where available.",
            "Distinguish contemporary reception from later interpretation.",
          ],
        },
        {
          type: "heading",
          level: 2,
          id: "build-research-record",
          text: "Build a Reusable Research Record",
        },
        {
          type: "paragraph",
          text:
            "Each work page should eventually combine bibliographic metadata, a concise description, digitized or photographed evidence, related archival material, translations, secondary scholarship and a transparent list of questions still requiring research.",
        },
      ],
      sources: [
        {
          label: "Works Catalogue",
          href: "../Works/works.html",
          note: "Selected works and thematic research paths.",
        },
        {
          label: "Editorial Policy",
          href: "../policies.html#editorial-policy",
          note: "Standards for citation, translation and interpretive claims.",
        },
      ],
      related: ["open-archive", "building-chronology", "verifying-materials"],
    },

    "private-collections": {
      id: "private-collections",
      category: "Archive",
      date: "2026-07-19",
      displayDate: "19.07.2026",
      title: "From Private Collections to Public Memory",
      deck:
        "What must happen before a family photograph, letter or document can responsibly become part of a public archive.",
      author: "Archive Desk",
      heroLabel: "Private Collections",
      heroNumber: "03",
      blocks: [
        {
          type: "lead",
          text:
            "Private materials carry two histories at once: the event or person they document, and the history of how the object survived in a family, personal or institutional collection.",
        },
        {
          type: "heading",
          level: 2,
          id: "record-provenance",
          text: "Record Provenance First",
        },
        {
          type: "paragraph",
          text:
            "Before digitization, the museum should record who holds the item, how it came into that person’s possession, whether it is an original or copy and whether related pages or objects remain elsewhere.",
        },
        {
          type: "heading",
          level: 2,
          id: "permission-is-specific",
          text: "Permission Must Be Specific",
        },
        {
          type: "paragraph",
          text:
            "Ownership of a physical object, copyright, privacy interests and permission to display a digital reproduction may belong to different people. The contribution process must therefore document exactly what the museum is permitted to preserve and publish.",
        },
        {
          type: "note",
          title: "Archive practice",
          text:
            "The museum should preserve the highest-quality original file received, create a separate publication copy and retain the contributor’s description alongside later cataloguing notes.",
        },
        {
          type: "heading",
          level: 2,
          id: "contextualize-without-overwriting",
          text: "Contextualize Without Overwriting",
        },
        {
          type: "paragraph",
          text:
            "A contributor’s recollection should be preserved in their own words. Editorial metadata may add dates, identifications and cross-references, but it should remain visibly distinct from the contributor’s testimony.",
        },
      ],
      sources: [
        {
          label: "Archive Page",
          href: "../archive.html",
          note: "Collection categories, access labels and date filtering.",
        },
        {
          label: "Contact Page",
          href: "../contact.html",
          note: "Submission route for archival material and permissions.",
        },
      ],
      related: ["open-archive", "oral-testimony", "verifying-materials"],
    },

    "verifying-materials": {
      id: "verifying-materials",
      category: "Editorial",
      date: "2026-07-10",
      displayDate: "10.07.2026",
      title: "How We Verify Historical Materials",
      deck:
        "A transparent sequence for assessing provenance, dates, authorship, context and publication rights.",
      author: "Editorial Team",
      heroLabel: "Verification",
      heroNumber: "04",
      blocks: [
        {
          type: "lead",
          text:
            "Verification is not a single yes-or-no decision. It is a sequence of documented checks, and each check may produce a different degree of confidence.",
        },
        {
          type: "heading",
          level: 2,
          id: "inspect-object",
          text: "Inspect the Object",
        },
        {
          type: "paragraph",
          text:
            "The process begins with the material itself: format, handwriting, typeface, paper, stamps, annotations, file metadata, visible alterations and the relationship between front, back and accompanying pages.",
        },
        {
          type: "heading",
          level: 2,
          id: "compare-independent-records",
          text: "Compare Independent Records",
        },
        {
          type: "paragraph",
          text:
            "Names, dates and events should be compared with independent catalogues, publications, correspondence, photographs or institutional records. Agreement strengthens identification; disagreement becomes part of the catalogue note rather than something to hide.",
        },
        {
          type: "list",
          ordered: false,
          items: [
            "Confirmed: supported by direct and mutually consistent evidence.",
            "Probable: strongly supported but not fully conclusive.",
            "Attributed: identified by a named source or contributor.",
            "Unverified: retained for research but not presented as established.",
          ],
        },
        {
          type: "heading",
          level: 2,
          id: "publish-verification-status",
          text: "Publish the Verification Status",
        },
        {
          type: "paragraph",
          text:
            "Readers should be able to see not only the museum’s conclusion but also the status of the underlying evidence. A catalogue record should say when a date is approximate, when an identification is attributed and when a reproduction has been restored or altered for legibility.",
        },
      ],
      sources: [
        {
          label: "Editorial Policy",
          href: "../policies.html#editorial-policy",
          note: "Evidence, attribution and correction standards.",
        },
        {
          label: "Archive Methodology",
          href: "../archive.html",
          note: "Record-level provenance, rights and certainty fields.",
        },
      ],
      related: ["building-chronology", "private-collections", "open-archive"],
    },

    "oral-testimony": {
      id: "oral-testimony",
      category: "Archive",
      date: "2026-06-29",
      displayDate: "29.06.2026",
      title: "Preserving Oral Testimony Without Freezing Memory",
      deck:
        "Oral history preserves voice and experience, but recollection must remain attributed, contextualized and open to comparison.",
      author: "Oral History Desk",
      heroLabel: "Oral Testimony",
      heroNumber: "05",
      blocks: [
        {
          type: "lead",
          text:
            "An interview is both evidence about the past and a record of how the past is remembered at a particular moment. Preserving that distinction is essential.",
        },
        {
          type: "heading",
          level: 2,
          id: "preserve-voice",
          text: "Preserve the Voice",
        },
        {
          type: "paragraph",
          text:
            "Transcripts make interviews searchable, but they cannot replace tone, hesitation, emphasis and silence. Where rights permit, the archive should preserve the recording, a faithful transcript and a translated version as distinct objects.",
        },
        {
          type: "heading",
          level: 2,
          id: "attribute-memory",
          text: "Attribute Memory",
        },
        {
          type: "paragraph",
          text:
            "An interviewee’s account should be presented as their testimony, not silently converted into the museum’s factual narration. Contradictory accounts may both be historically valuable when their origins and dates are clear.",
        },
        {
          type: "quote",
          text:
            "Oral history does not remove uncertainty; it allows uncertainty to speak in a human voice.",
          cite: "Archive working principle",
        },
        {
          type: "heading",
          level: 2,
          id: "consent-and-access",
          text: "Consent and Access",
        },
        {
          type: "paragraph",
          text:
            "Interview agreements should define whether the recording may be published, quoted, translated, edited, deposited for restricted research or withheld until a later date. These choices belong in the catalogue record.",
        },
      ],
      sources: [
        {
          label: "Contact Page",
          href: "../contact.html",
          note: "Route for testimony and recorded-material submissions.",
        },
        {
          label: "Privacy Policy",
          href: "../policies.html#privacy-policy",
          note: "Treatment of personal information and living persons.",
        },
      ],
      related: ["private-collections", "building-chronology", "open-archive"],
    },

    "building-chronology": {
      id: "building-chronology",
      category: "Research",
      date: "2026-06-18",
      displayDate: "18.06.2026",
      title: "Building a Chronology When Sources Disagree",
      deck:
        "A chronology should display the quality of its dates, not merely arrange claims in a confident-looking sequence.",
      author: "Research Desk",
      heroLabel: "Chronology",
      heroNumber: "06",
      blocks: [
        {
          type: "lead",
          text:
            "Timelines appear authoritative because they place events in order. That visual confidence can become misleading when the underlying dates are approximate, retrospective or disputed.",
        },
        {
          type: "heading",
          level: 2,
          id: "classify-dates",
          text: "Classify Every Date",
        },
        {
          type: "paragraph",
          text:
            "The museum should distinguish an exact date stated in a contemporaneous document from a month, year, estimated range or later recollection. The interface can display all of them, but the metadata must retain the distinction.",
        },
        {
          type: "list",
          ordered: false,
          items: [
            "Exact date",
            "Approximate date",
            "Date range",
            "Date attributed to a named source",
            "Date disputed by competing sources",
          ],
        },
        {
          type: "heading",
          level: 2,
          id: "do-not-force-agreement",
          text: "Do Not Force Agreement",
        },
        {
          type: "paragraph",
          text:
            "Where credible records conflict, the chronology should not invent a compromise date. It should present the competing dates, identify their sources and explain why the museum has selected one for sorting or display, if a selection is necessary.",
        },
        {
          type: "heading",
          level: 2,
          id: "connect-events-records",
          text: "Connect Events to Records",
        },
        {
          type: "paragraph",
          text:
            "A useful chronology is not merely a list. Each entry should connect to documents, photographs, publications, testimony and related people so that readers can move from a date to the evidence supporting it.",
        },
      ],
      sources: [
        {
          label: "Archive Date Search",
          href: "../archive.html",
          note: "Interactive date-range interface and record metadata.",
        },
        {
          label: "Verification Article",
          href: "./blog-post.html?post=verifying-materials",
          note: "Verification categories used across the museum.",
        },
      ],
      related: ["verifying-materials", "reading-the-works", "oral-testimony"],
    },

    "development-update": {
      id: "development-update",
      category: "Updates",
      date: "2026-06-04",
      displayDate: "04.06.2026",
      title: "Museum Development Update: Structure Before Scale",
      deck:
        "Why the project is building stable categories, metadata and reusable page systems before attempting to publish a large volume of material.",
      author: "Project Development Team",
      heroLabel: "Development",
      heroNumber: "07",
      blocks: [
        {
          type: "lead",
          text:
            "A digital museum can accumulate pages quickly and still remain difficult to research. The project is therefore prioritizing structure before volume.",
        },
        {
          type: "heading",
          level: 2,
          id: "shared-system",
          text: "One Shared System",
        },
        {
          type: "paragraph",
          text:
            "The principal sections use a common visual language, navigation system, accessibility approach and editorial vocabulary. Reusable templates reduce inconsistency and make later corrections easier to apply across the site.",
        },
        {
          type: "heading",
          level: 2,
          id: "metadata-before-volume",
          text: "Metadata Before Volume",
        },
        {
          type: "paragraph",
          text:
            "Before adding thousands of files, the archive needs stable fields for dates, creators, people, places, provenance, rights, languages, material types and verification status. Otherwise future search and comparison will be unreliable.",
        },
        {
          type: "note",
          title: "Current principle",
          text:
            "Every new page should be reusable, every archival item should be identifiable and every important factual claim should be capable of receiving a source.",
        },
        {
          type: "heading",
          level: 2,
          id: "next-development-stage",
          text: "Next Development Stage",
        },
        {
          type: "paragraph",
          text:
            "The next stage is to connect catalogue records, individual work pages, journal entries and biographical chronology through shared identifiers. This will allow readers to move between a person, an event, a document and the scholarship discussing it.",
        },
      ],
      sources: [
        {
          label: "About the Project",
          href: "../about.html",
          note: "Mission, methodology and development roadmap.",
        },
        {
          label: "Archive Page",
          href: "../archive.html",
          note: "Demonstration of structured metadata and search tools.",
        },
      ],
      related: ["open-archive", "reading-the-works", "private-collections"],
    },
  },
};
