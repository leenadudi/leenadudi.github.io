/** Site content: sections, colours, and every item shown on the page. */

export const EMAIL    = "ldudi@mit.edu";
export const GITHUB   = "https://github.com/leenadudi";
export const LINKEDIN = "https://linkedin.com/in/leenadudi";

export const SECTIONS = [
  { id: "experience", title: "experience", color: "#34C8C5" },
  { id: "projects",   title: "projects",   color: "#DF84BD" },
  { id: "school",     title: "school",     color: "#FC8A8E" },
  { id: "service",    title: "service",    color: "#FFAE69" },
  { id: "hobbies",    title: "hobbies",    color: "#FEE09D" },
] as const;
export type SectionId = (typeof SECTIONS)[number]["id"];

// Each section is a list of items. Every item keeps a visible bullet-point
// description (from Leena's resume) AND an optional list of attachments
// (`media`) - slide decks, PDFs, links, papers, images, or the live graph.
// Attachments open in the interactive detail view. Empty `media` renders an
// "attach slides / links" affordance so Leena can drop files in later.
// `todo: true` marks bullets that still need her real details.
//
// To attach a deck later: export it to numbered PNGs under
//   public/media/<slug>/1.png, 2.png, …
// then add  { type: "slides", images: ["/media/<slug>/1.png", …] }  to media.
export type Media =
  | { type: "slides"; label?: string; images: string[] }
  | { type: "link";   label: string; url: string }
  | { type: "paper";  label: string; url: string }
  | { type: "image";  src: string; caption?: string }
  | { type: "embed";  kind: "vibegraph" }
  | { type: "iframe"; url: string; label?: string }
  | { type: "pdf";    url: string; label?: string };

export type Activity = { name: string; role?: string; description?: string };
export type Award    = { name: string; description?: string };

export type Item = {
  title: string;
  meta?: string;      // date · place
  image?: string;     // screenshot under /media (projects)
  bullets: string[];  // visible description
  art: string;        // ItemVisual art id
  skills?: string[];  // tech / skill chips shown under bullets
  activities?: Activity[]; // for school section clubs list
  awards?: Award[];        // for school section awards cards
  todo?: boolean;     // bullets are placeholders to complete
  media?: Media[];    // attachments (slides, links, papers, …)
};

export const SECTION_CONTENT: { items: Item[] }[] = [
  // ── experience (reverse-chronological) ───────────────────────────
  { items: [
      { title: "Agent Vista", meta: "Software Engineer Intern · Jan 2026 - present · Cambridge, MA", art: "flow",
        bullets: [
          "Built a document-ingestion and RAG search system: chunks PDFs via the Anthropic Claude Batch API, stores embeddings in PostgreSQL, and serves a query API answering natural-language questions over the documents; deployed on AWS ECS Fargate via Terraform with S3 storage and CodeBuild CI/CD",
          "Designed a multi-LLM business classification system: given a company name and website, predicts industry codes via pgvector semantic search, fuzzy text matching, and three model providers (Claude, Gemini, OpenAI); added hash-based change detection to cache results and sharply cut repeat API costs",
          "Built a Playwright-based automated collector for public state business-registry data: robust browser session/state handling with fixture-based CI tests; integrated into Spring Boot services with configurable, region-aware scoring rules",
          "Built a company scoring and prioritization engine: a configurable multi-factor weighted framework using Claude with live web-search research, automated pre-filtering, resumable batch processing, and a Flask streaming UI with per-factor feedback",
          "Shipped a PII-masking logging library adopted across Java microservices: per-rule configuration toggles and structured JSON field masking for safe, compliant application logs",
        ],
        skills: ["Python", "Java", "Spring Boot", "TypeScript", "Playwright", "PostgreSQL", "pgvector", "LLMs", "AWS ECS", "Terraform", "Docker", "Flask"] },
      { title: "Bungii", meta: "FP&A / Data Analysis Intern · May - June 2025 · Overland Park, KS", art: "route",
        bullets: [
          "Led an AI-driven dynamic driver pay project to improve margin efficiency across 15+ delivery markets",
          "Optimized last-mile delivery routes for 10+ enterprise clients, reducing operational overhead",
          "Conducted market research to scope expansion into the box-truck segment",
        ],
        skills: ["Python", "SQL", "Excel", "Pandas"] },
      { title: "NASA · Earth Sciences Division", meta: "Climate Data Research Intern · May - Aug 2024 · Remote", art: "wildfire",
        bullets: [
          "Built a cross-platform wildfire-risk app in Flutter, running a YOLOv8 model on-device via TensorFlow Lite for real-time hazard detection",
          "Co-authored \"Integrating Machine Learning and Citizen Science in CS-FLARE\", presented at AGU 2024 National Conference",
          "Processed satellite and citizen-science datasets to surface actionable wildfire risk signals",
        ],
        skills: ["Flutter", "Dart", "TensorFlow Lite", "YOLOv8", "Python"],
        media: [{ type: "pdf", url: "/cs-flare-paper.pdf", label: "CS-FLARE Research Paper" }] },
      { title: "Kiewit Engineering", meta: "Financial Data Analysis Intern · June - July 2023 · Lenexa, KS", art: "grid",
        bullets: [
          "Automated cost-report updates with custom Python scripts, eliminating manual data entry across a 500+ project billing ledger",
          "Consolidated and standardized a company-wide financial tracking spreadsheet spanning multiple divisions",
        ],
        skills: ["Python", "Excel", "SQL"] },
    ] },

  // ── projects ──────────────────────────────────────────────────────
  { items: [

      { title: "clerkflow", meta: "2025", art: "civic", image: "/media/clerkflow.jpg",
        bullets: [
          "A clerk shouldn't have to spend a weekend digging through PDFs to answer \"did we already authorize this?\" Clerkflow reads a city's raw records and builds a structured understanding of how that government actually works: people, departments, resolutions, vendors, grants, and votes assembled into a searchable knowledge graph.",
          "Ingests municipal PDFs through an agentic profiler: Claude Haiku classifies document type and extracts structured metadata before routing to the pipeline; Tesseract OCR + Claude Vision handle scanned and complex layouts",
          "Triple-store architecture: Postgres for structured facts, pgvector + Voyage AI embeddings for semantic search, and Neo4j for entity graphs, unified behind a single natural-language query interface",
        ],
        skills: ["Python", "Flask", "Claude", "pgvector", "Neo4j", "PostgreSQL"],
        media: [{ type: "iframe", url: "https://council-knowledge-base.vercel.app/" }] },
      { title: "leena's music brain", meta: "2025", art: "vibegraph", image: "/media/musicbrain.jpg",
        bullets: [
          "Pulled five years of Spotify streaming history and enriched ~2,000 tracks with nine audio features (ReccoBeats API), cached in SQLite",
          "Maps the whole library with seeded UMAP so on-screen distance means real audio similarity, coloured along a continuous calm→hype spectrum (PCA)",
          "Interactive Canvas viz: a biplot \"vibe compass\" showing which trait rises in each direction, and click any track to surface its nearest neighbours with a 9-axis radar",
        ],
        skills: ["TypeScript", "React", "SQLite", "UMAP", "PCA", "Louvain", "Canvas 2D"],
        media: [{ type: "embed", kind: "vibegraph" }] },
      { title: "wyrather", meta: "2025", art: "route",
        bullets: [
          "Daily \"would you rather\" polls with real-time head-to-head debates, where users vote, see live split counts, then enter a matchmaking queue to argue against someone who voted the opposite way",
          "All write paths run through Next.js server actions with Zod validation; Postgres Row-Level Security enforces a fully read-only browser client, with no direct table access from the frontend",
          "Atomic PL/pgSQL functions (cast_vote, join_debate, like_comment) eliminate race conditions under concurrent load; debate matchmaking queue uses a 5-second heartbeat ping and 30-second freshness window to filter ghost users",
          "Anonymous-to-authenticated account upgrade via Supabase identity linking, so Google OAuth and magic-link email both preserve all prior anonymous votes and history with zero data loss",
        ],
        skills: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Row-Level Security"],
        media: [{ type: "iframe", url: "https://wyrather.me/" }] },
      { title: "llrise", meta: "MIT Lincoln Laboratory · July 2024", art: "radar", image: "/media/llrise.jpg",
        bullets: [
          "1 of 26 students selected nationally for the residential LLRISE (Lincoln Laboratory Radar Introduction for Student Engineers) program",
          "Built a complete radar system from scratch over 2 weeks: Doppler radar to measure velocity and Synthetic Aperture Radar (SAR) for 2D image reconstruction",
          "Worked directly with Lincoln Laboratory researchers on RF hardware, signal processing, and live data collection",
          "Presented final experiments and results to 150+ professionals at MIT Lincoln Laboratory",
        ],
        skills: ["Radar Systems", "Signal Processing", "SAR", "RF Hardware", "MATLAB"],
        media: [{ type: "link", label: "slides", url: "https://docs.google.com/presentation/d/1aUz7ceD4-VOW0ucrD849lIC-l9yQFpfIZ0ghPoyEl7Q/" }] },
    ] },

  // ── school ────────────────────────────────────────────────────────
  { items: [
      { title: "Massachusetts Institute of Technology", meta: "B.S. Computer Science and Engineering · Class of 2029", art: "dome",
        bullets: [
          "Intro to Programming & CS",
          "Fundamentals of Programming",
          "Physics I & II",
          "Behavioral Science & Urban Mobility",
          "Solving Complex Problems",
          "Linear Algebra",
          "Communicating with Data",
        ],
        activities: [
          { name: "MIT AppDev", role: "Marketing Chair" },
          { name: "Women in AI", role: "Resources Lead", description: "Curates AI/ML learning resources, scholarship and grant opportunities for members and the broader community; updates the website with new resources; coordinates intro AI/ML workshops alongside the professional development team" },
          { name: "Women in EECS" },
          { name: "Undergraduate Women in Physics" },
          { name: "Society of Women Engineers" },
          { name: "Ohms Acapella" },
        ],
        awards: [
          { name: "U.S. Presidential Scholar" },
          { name: "National Merit Scholar" },
          { name: "Letter of Commendation from Kamala Harris" },
          { name: "FIRST Robotics Dean’s List Intl Finalist" },
          { name: "Disney Dreamer" },
          { name: "NYSC Delegate" },
        ] },
      { title: "fifa + mit sports lab", meta: "ML Research · Last Touch Project · Sept 2025 - present", art: "soccer",
        bullets: [
          "Analyzing the accuracy of an ML last-touch detection system on FIFA’s optical tracking data, quantifying how reliably it identifies the last player to contact the ball and the exact moment of contact across full World Cup matches",
          "Characterized model error against frame-accurate ground truth: temporal deviation (predicted vs. true contact frame) and correct last-toucher identification, broken out by event type and difficulty (deflections, near-simultaneous touches, grazing contact, occluded players)",
          "Assessed evaluation reliability with inter-annotator agreement, bounding label noise so the measured error reflects the model rather than the reference, the difference between a trustworthy accuracy number and a misleading one",
          "Translated the error analysis into a readiness assessment: whether last-touch timestamps are precise enough to support referee/VAR review of restart decisions (throw-ins, corners, goal kicks)",
          "Findings feed the decision to keep not-yet-ready technology out of live competition, favoring rigorous evaluation over premature deployment, a real win for research integrity in the sport",
        ],
        skills: ["Python", "Pandas", "Model Evaluation", "Error Analysis", "Statistical Analysis", "Inter-Annotator Agreement", "Optical Tracking", "Computer Vision"] },
      { title: "mit urban risk lab", meta: "Remote Sensing & Geospatial ML · Sept - Dec 2025", art: "geo",
        bullets: [
          "Built an interactive Google Earth Engine app for land-cover similarity search over DeepMind AlphaEarth annual satellite embeddings: draw a region of interest, drop labeled points on the map, and it maps every pixel matching that feature's signature",
          "Implemented the similarity engine: samples the embedding vector at each labeled point, scores every pixel by dot-product similarity to those samples, thresholds, and vectorizes the matches into clean polygons for a labeled map",
          "Ran supervised classification over the embeddings (random forest, 70/30 train-test split, evaluated with confusion matrices and per-class accuracy) to map fine-grained land classes across a region",
          "Quantified multi-year change by differencing annual embeddings and computing area gained and lost in km2 (2019 to 2021), then validated the result against JRC Global Surface Water reference data, matching to within ~0.0025 km2",
          "Contributing to a method for quantifying ecosystem-health change from Traditional Ecological Knowledge (TEK) informed embeddings: turning community-defined labels (healthy, recovering, declining), ground-truthed via COPIN community mapping, into an Ecosystem Health Score tracked from 2017 to 2025",
        ],
        skills: ["Google Earth Engine", "AlphaEarth Embeddings", "JavaScript", "Python", "Random Forest", "Change Detection", "Remote Sensing", "Geospatial Analysis"],
        media: [{ type: "iframe", url: "https://jovial-arch-473418-s0.projects.earthengine.app/view/similarity-search", label: "Live Earth Engine App" }] },
      { title: "momentum x blue origin", meta: "MIT x Blue Origin Design Challenge · 2024-2025", art: "launch",
        bullets: [
          "Selected for MIT Momentum, a systems engineering challenge run by Blue Origin engineers, tasked with designing minimum-mass infrastructure to sustain a 5,000-person Mars colony from 2075 to 2125",
          "Led Communications, Data, and Shelter: designed a 3-layer comms stack (UHF orbital relay, S-band direct-to-Earth, Ka-band high-speed video via 4 HTS satellites) with a per-person bandwidth cap of 3.5 hrs/day",
          "Designed autonomous positioning using celestial tracking, PNT technology, and pseudolites to replace GPS; added Terrain Relative Navigation for precision landing; no GPS exists on Mars",
          "Proposed an on-colony data center to eliminate the 20-minute Earth round-trip delay for real-time operational decisions",
          "Phased shelter plan: Sierra Space LIFE 1400 modules through 2060 transitioning to lava tubes reinforced with MarsCrete; evaluated Hebrus Valles and Arsia Mons as candidate sites",
        ],
        skills: ["Systems Engineering", "Mission Design", "Communications Architecture", "Orbital Mechanics", "Structural Analysis"],
        media: [{ type: "pdf", url: "/momentum-proposal.pdf", label: "Momentum proposal" }] },
      { title: "distance & delay research", meta: "MIT 11.158 Research Paper · Dec 2025", art: "transit",
        bullets: [
          "Designed and ran an original survey of 75 MIT students on commute distance, primary mode, max wait tolerance, and behavioral response to transit delays",
          "Key finding: longer commutes do not build patience; students adapt by switching to autonomous, schedule-independent modes (biking/scootering) to avoid waiting, rather than developing tolerance for delays",
          "Transit users showed highest waiting tolerance (mean 15 min) vs. bikers and scooter users (mean 3 min), driven by behavioral habituation to headway-based systems rather than by commute distance",
          "72-83% of respondents across all distance groups switched modes immediately when faced with an 8-minute delay, showing strong preference for control and predictability over scheduled transit",
          "Findings suggest campus planners should prioritize reducing uncertainty (real-time arrivals, reliable headways) over raw wait-time reduction to retain low-carbon mode share",
        ],
        skills: ["Python", "Pandas", "Matplotlib", "Survey Design", "Statistical Analysis", "Google Forms"],
        media: [{ type: "pdf", url: "/distance-delay-research.pdf", label: "Research Paper" }] },
    ] },

  // ── service ───────────────────────────────────────────────────────
  { items: [
      { title: "Cambridge Public Schools", meta: "Cambridge School Volunteers · Tutor", art: "mentor",
        bullets: [
          "Volunteer tutor with Cambridge School Volunteers (CSV), serving Grades 6-8 students in after-school Learning Centers!",
          "Matched one-on-one with a student referred by their teacher: help with homework, reinforce study skills, and provide general academic coaching in a supportive setting",
        ] },
      { title: "Million Girls Moonshot", meta: "Flight Crew · STEM Advocate", art: "rocket",
        bullets: [
          "Selected nationally as a member of the Million Girls Moonshot Flight Crew, sponsored by the Intel Foundation and the Geena Davis Institute on Gender in Media, working to close the gender gap in STEM",
          "Partner with the U.S. Department of Education and the White House National Space Council as a youth ambassador encouraging girls' engagement in STEM fields",
          "Recognized by Vice President Kamala Harris: \"Through your advocacy and your outreach, you are helping to build a STEM workforce that reflects the diversity of this country. This work will drive innovation and empower generations of future STEM leaders.\"",
        ] },
      { title: "Heartland STEM", meta: "President · 501(c)(3) · Jun 2023 - May 2025", art: "mentor",
        bullets: [
          "Ran a 501(c)(3) nonprofit in partnership with UnitedHealthcare, soliciting grants from 600 schools across Kansas and Nebraska",
          "Reviewed grant applications and distributed approximately $15,000 each year to fund student STEM programs",
        ] },
      { title: "FIRST Tech Challenge · Cobalt Colts 6547", meta: "STEM Outreach & Mentorship · 2021 - 2025", art: "robot",
        bullets: [
          "Mentor in the Global Robotics Exchange, a four-week virtual program connecting the Cobalt Colts with FTC teams from Morocco and Libya",
          "Ran hands-on robot demos and STEM activities across the community: taught hundreds of kids to drive robots at the MO State Fair, plus Museum @ Prairiefire, Ronald McDonald House, Girl Scouts Robotics Badge Day, Cedar Hills Y-Care, and local carnivals",
          "Built a wheelchair costume for two children and connected FTC teams across the nation with kids needing wheelchair costumes",
        ] },
      { title: "Business Professionals of America", meta: "Kansas State Officer", art: "mentor",
        bullets: [
          "Elected state officer for Kansas BPA, one of 49,000+ members across 44 states in the nation’s leading career and technical student organization for future business and technology leaders",
          "Represented Kansas members at national leadership conferences; led professional development sessions and workshops for local chapters statewide",
          "Organized and oversaw competitive events; collaborated with the state board to set chapter priorities and expand BPA’s reach across Kansas high schools",
        ] },
    ] },

  // ── hobbies ───────────────────────────────────────────────────────
  { items: [
      { title: "basketball", art: "basketball", todo: true,
        bullets: ["Add a line: where you play, favorite team, pickup vs. league"] },
      { title: "singing", art: "music", todo: true,
        bullets: ["Add a line: Ohms Acapella at MIT? solo? your go-to song"] },
      { title: "rollercoasters · obviously", art: "coaster", todo: true,
        bullets: ["The thread running through this whole site", "Add favorites: top coaster, dream park, biggest drop"] },
    ] },
];
