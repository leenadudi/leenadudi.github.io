import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useScroll, motion } from "motion/react";
import PortfolioItems from "./components/PortfolioItems";
import ExperienceSection from "./components/ExperienceSection";
import ProjectsSection from "./components/ProjectsSection";
import SchoolSection from "./components/SchoolSection";
import HobbiesSection from "./components/HobbiesSection";

const SECTIONS = [
  { id: "work",     title: "experience", color: "#34C8C5" },
  { id: "projects", title: "projects",   color: "#DF84BD" },
  { id: "research", title: "school",     color: "#FC8A8E" },
  { id: "service",  title: "service",    color: "#FFAE69" },
  { id: "hobbies",  title: "hobbies",    color: "#FEE09D" },
];

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
      { title: "Agent Vista", meta: "Software Engineer Intern · Jan 2026 – present · Cambridge, MA", art: "flow",
        bullets: [
          "Built a document-ingestion and RAG search system: chunks PDFs via the Anthropic Claude Batch API, stores embeddings in PostgreSQL, and serves a query API answering natural-language questions over the documents; deployed on AWS ECS Fargate via Terraform with S3 storage and CodeBuild CI/CD",
          "Designed a multi-LLM business classification system: given a company name and website, predicts industry codes via pgvector semantic search, fuzzy text matching, and three model providers (Claude, Gemini, OpenAI); added hash-based change detection to cache results and sharply cut repeat API costs",
          "Built a Playwright-based automated collector for public state business-registry data: robust browser session/state handling with fixture-based CI tests; integrated into Spring Boot services with configurable, region-aware scoring rules",
          "Built a company scoring and prioritization engine: a configurable multi-factor weighted framework using Claude with live web-search research, automated pre-filtering, resumable batch processing, and a Flask streaming UI with per-factor feedback",
          "Shipped a PII-masking logging library adopted across Java microservices: per-rule configuration toggles and structured JSON field masking for safe, compliant application logs",
        ],
        skills: ["Python", "Java", "Spring Boot", "TypeScript", "Playwright", "PostgreSQL", "pgvector", "LLMs", "AWS ECS", "Terraform", "Docker", "Flask"] },
      { title: "Bungii", meta: "FP&A / Data Analysis Intern · May – June 2025 · Overland Park, KS", art: "route",
        bullets: [
          "Led an AI-driven dynamic driver pay project to improve margin efficiency across 15+ delivery markets",
          "Optimized last-mile delivery routes for 10+ enterprise clients, reducing operational overhead",
          "Conducted market research to scope expansion into the box-truck segment",
        ],
        skills: ["Python", "SQL", "Excel", "Pandas"] },
      { title: "NASA · Earth Sciences Division", meta: "Climate Data Research Intern · May – Aug 2024 · Remote", art: "wildfire",
        bullets: [
          "Built a cross-platform wildfire-risk app in Flutter, running a YOLOv8 model on-device via TensorFlow Lite for real-time hazard detection",
          "Co-authored \"Integrating Machine Learning and Citizen Science in CS-FLARE\", presented at AGU 2024 National Conference",
          "Processed satellite and citizen-science datasets to surface actionable wildfire risk signals",
        ],
        skills: ["Flutter", "Dart", "TensorFlow Lite", "YOLOv8", "Python"],
        media: [{ type: "pdf", url: "/cs-flare-paper.pdf", label: "CS-FLARE Research Paper" }] },
      { title: "Kiewit Engineering", meta: "Financial Data Analysis Intern · June – July 2023 · Lenexa, KS", art: "grid",
        bullets: [
          "Automated cost-report updates with custom Python scripts, eliminating manual data entry across a 500+ project billing ledger",
          "Consolidated and standardized a company-wide financial tracking spreadsheet spanning multiple divisions",
        ],
        skills: ["Python", "Excel", "SQL"] },
    ] },

  // ── projects ──────────────────────────────────────────────────────
  { items: [

      { title: "clerkflow", meta: "2025", art: "civic",
        bullets: [
          "A clerk shouldn't have to spend a weekend digging through PDFs to answer \"did we already authorize this?\" Clerkflow reads a city's raw records and builds a structured understanding of how that government actually works: people, departments, resolutions, vendors, grants, and votes assembled into a searchable knowledge graph.",
          "Ingests municipal PDFs through an agentic profiler: Claude Haiku classifies document type and extracts structured metadata before routing to the pipeline; Tesseract OCR + Claude Vision handle scanned and complex layouts",
          "Triple-store architecture: Postgres for structured facts, pgvector + Voyage AI embeddings for semantic search, and Neo4j for entity graphs, unified behind a single natural-language query interface",
        ],
        skills: ["Python", "Flask", "Claude", "pgvector", "Neo4j", "PostgreSQL"],
        media: [{ type: "iframe", url: "https://council-knowledge-base.vercel.app/" }] },
      { title: "leena's music brain", meta: "2025", art: "vibegraph",
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
      { title: "llrise", meta: "Technology Student Researcher · July 2024", art: "radar",
        bullets: [
          "1 of 26 students selected nationally for the residential LLRISE (Lincoln Laboratory Radar Introduction for Student Engineers) program",
          "Built a complete radar system from scratch over 2 weeks: Doppler radar to measure velocity and Synthetic Aperture Radar (SAR) for 2D image reconstruction",
          "Worked directly with Lincoln Laboratory researchers on RF hardware, signal processing, and live data collection",
          "Presented final experiments and results to 150+ professionals at MIT Lincoln Laboratory",
        ],
        skills: ["Radar Systems", "Signal Processing", "SAR", "RF Hardware", "MATLAB"],
        media: [{ type: "iframe", url: "https://docs.google.com/presentation/d/1aUz7ceD4-VOW0ucrD849lIC-l9yQFpfIZ0ghPoyEl7Q/embed?start=false&loop=false" }] },
    ] },

  // ── school ────────────────────────────────────────────────────────
  { items: [
      { title: "Massachusetts Institute of Technology", meta: "BS CS · Computer Science & Engineering · Class of 2029", art: "dome",
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
      { title: "fifa + mit sports lab", meta: "ML Research · Last Touch Project · Sept 2025 – present", art: "soccer",
        bullets: [
          "Analyzing the accuracy of an ML last-touch detection system on FIFA’s optical tracking data, quantifying how reliably it identifies the last player to contact the ball and the exact moment of contact across full World Cup matches",
          "Characterized model error against frame-accurate ground truth: temporal deviation (predicted vs. true contact frame) and correct last-toucher identification, broken out by event type and difficulty (deflections, near-simultaneous touches, grazing contact, occluded players)",
          "Assessed evaluation reliability with inter-annotator agreement, bounding label noise so the measured error reflects the model rather than the reference, the difference between a trustworthy accuracy number and a misleading one",
          "Translated the error analysis into a readiness assessment: whether last-touch timestamps are precise enough to support referee/VAR review of restart decisions (throw-ins, corners, goal kicks)",
          "Findings feed the decision to keep not-yet-ready technology out of live competition, favoring rigorous evaluation over premature deployment, a real win for research integrity in the sport",
        ],
        skills: ["Python", "Pandas", "Model Evaluation", "Error Analysis", "Statistical Analysis", "Inter-Annotator Agreement", "Optical Tracking", "Computer Vision"] },
      { title: "mit urban risk lab", meta: "Remote Sensing & Geospatial ML · Sept – Dec 2025", art: "geo",
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
        media: [{ type: "iframe", url: "https://mitprod-my.sharepoint.com/personal/antn_mit_edu/_layouts/15/Doc.aspx?sourcedoc={09676424-2e2c-4b27-a189-5d03883b1858}&action=embedview&wdAr=1.7777777777777777" }] },
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
      { title: "Heartland STEM", meta: "President · 501(c)(3) · Jun 2023 – May 2025", art: "mentor",
        bullets: [
          "Ran a 501(c)(3) nonprofit in partnership with UnitedHealthcare, soliciting grants from 600 schools across Kansas and Nebraska",
          "Reviewed grant applications and distributed approximately $15,000 each year to fund student STEM programs",
        ] },
      { title: "FIRST Tech Challenge · Cobalt Colts 6547", meta: "STEM Outreach & Mentorship · 2021 – 2025", art: "robot",
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

const VW = 1000;
const VH = 600;
const K  = 0.5523;
const SW = 20;

// ── Phase 1 geometry ─────────────────────────────────────────────────────────
const LINE_Y     = [278, 301, 324, 347, 370] as const;
const APP_X      = 365;   // x where the flat strands start curving up into the loop
// Each strand makes its OWN loop; centres are stacked upward and leaned slightly
// right so the five rings nest into an interlocking tower (pink top → teal front).
const LOOP_R     = 58;                              // ring radius (equal → clean nested rings)
const LOOP_CX    = [605, 615, 625, 635, 645] as const;
const LOOP_CY    = [120, 143, 166, 189, 212] as const;
const WAVE_END_X = 870;
const WAVE_TOP_Y = [18, 41, 64, 87, 110] as const;
const DESCENT_R  = [45, 65, 85, 105, 125] as const;
// Each line's x on the right wall
const DX = DESCENT_R.map(dr => WAVE_END_X + dr); // [915,935,955,975,995]

// ── Phase 2 wave geometry ─────────────────────────────────────────────────────
// Lines turn from DOWN→LEFT at P2_TURN_Y using turn radius P2_TR[i].
// Because DX[i] - P2_TR[i] = 865 for all i, all lines arrive at the same
// x after the corner - they bundle vertically and wave together.
const P2_TURN_Y = 130;
const P2_TR     = [50, 70, 90, 110, 130] as const; // turn radii
const P2_AMP    = 95;   // peak wave amplitude (±y at the middle of the coil)
const P2_HW     = 96;   // half-wavelength (horizontal span per half-wave)
// Half-wave count across the coil (same for every strand).  Combined with a
// per-strand PHASE offset (i·2π/5) this makes the strands weave over one another.
// (span = P2_N·P2_HW = 672, so the coil runs from x=865 down to x=193.)
const P2_N      = 7;
// x where each line enters the wave section (all = 865)
const P2_WAVE_X = DX[0] - P2_TR[0]; // 865

// Drop points where each strand turns down and descends. They're ~22px apart
// so the five descents fall as a tight bundle at the far left.
const P2_LOOP_X = [65, 88, 111, 134, 157] as const; // descent x, pink→teal (far left)
const P2_QTR = 18;  // quarter-turn radius (LEFT → DOWN pivot)

// ── Phase 2b: cursive petal flourish (own sticky screen) ─────────────────────
// The strands descend off Phase 2's screen; here they re-enter from the top,
// turn RIGHT, run level, then loop through petals that ALTERNATE above and
// below the midline.  Each petal is one full garland (cycloid) loop
//   x = M·t + R·sin t,  y = cc ± R2·(1 − cos t),  t ∈ [0, 2π]
// which starts and ends ON the midline with a horizontal tangent, so
// consecutive mirrored petals stitch together smoothly and self-cross (M < R).
const P2B_M   = 13;   // rightward march per radian
const P2B_R   = 34;   // horizontal swing (> M ⇒ each petal self-crosses)
const P2B_R2  = 42;   // petal half-height (petal reaches 2·R2 from midline)
const P2B_N   = 4;    // number of petals (up, down, up, down)
const P2B_CC  = 250;  // flourish midline y for pink; each strand nests +22 below
const P2B_RUN = 70;   // level run after the right turn, before the petals

// Phase 3 columns - a strand lands where its post-flourish descent drops.
const CONTACT_X = P2_LOOP_X.map(
  (x) => x + 2 * P2_QTR + P2B_RUN + P2B_M * P2B_N * 2 * Math.PI
);
const FLOOR_Y = 300; // y where strands land in Phase 3

// Label text color: cream on dark columns, warm-dark on light ones
// Pick the higher-contrast ink for a given background — cream on dark sections,
// dark teal on light ones (e.g. the orange projects panel) — via WCAG contrast.
const CREAM = "#FDF6EC";
const DARK_INK = "#000000";
function relLuminance(hex: string): number {
  const c = hex.replace("#", "").slice(0, 6);
  const lin = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
export function labelColor(hex: string): string {
  return contrast(hex, DARK_INK) >= contrast(hex, CREAM) ? DARK_INK : CREAM;
}

// ── Path builders ─────────────────────────────────────────────────────────────

function phase1Path(i: number): string {
  const y  = LINE_Y[i];
  const wt = WAVE_TOP_Y[i];
  const dr = DESCENT_R[i];
  const dx = DX[i];
  const cx = LOOP_CX[i];
  const cy = LOOP_CY[i];
  const r  = LOOP_R;
  const bot = cy + r;              // loop entry/exit (6 o'clock)
  return [
    `M -50,${y}`, `L ${APP_X},${y}`,
    // flat strand sweeps up to the bottom of this line's own loop
    `C ${cx-130},${y} ${cx-60},${bot} ${cx},${bot}`,
    // full CW circle: bottom → right → top → left → bottom
    `C ${cx+r*K},${bot} ${cx+r},${cy+r*K} ${cx+r},${cy}`,
    `C ${cx+r},${cy-r*K} ${cx+r*K},${cy-r} ${cx},${cy-r}`,
    `C ${cx-r*K},${cy-r} ${cx-r},${cy-r*K} ${cx-r},${cy}`,
    `C ${cx-r},${cy+r*K} ${cx-r*K},${bot} ${cx},${bot}`,
    // leave the loop bottom and sweep up to the wave crest, then descend
    `C ${cx+100},${bot} ${WAVE_END_X-40},${wt} ${WAVE_END_X},${wt}`,
    `C ${WAVE_END_X+dr*K},${wt} ${dx},${wt+dr*(1-K)} ${dx},${wt+dr}`,
    `L ${dx},${VH+10}`,
  ].join(" ");
}

/**
 * Phase 2 path for line i:
 *   enter from top → descend to P2_TURN_Y
 *   → 90° CW arc  DOWN→LEFT  (pivot around corner)
 *   → P2_N sinusoidal half-waves going LEFT (all lines share the same count,
 *     so they travel as one nested ribbon)
 *   → straight run LEFT to this line's own drop x (staggers the loop stack)
 *   → 90° arc  LEFT→DOWN  → CW loop → descend off bottom
 */
function phase2Path(i: number): string {
  const dx = DX[i];
  const tr = P2_TR[i];
  const ey = P2_TURN_Y;
  const cy = ey + tr;       // ribbon centre y for this line
  const wx = P2_WAVE_X;    // 865 - x where wave begins (same for all)

  // ── top turn: DOWN→LEFT, CW quarter-circle ─────────────────────────────
  // Bezier: arrive at (dx,ey) going down, depart (wx,cy) going left
  const topTurn = `C ${dx},${ey + tr*K} ${dx - tr + tr*K},${cy} ${wx},${cy}`;

  // ── coiled wave travelling LEFT ─────────────────────────────────────────
  // Each strand is a sine with its OWN phase (i·2π/5) under a bell envelope
  // that is zero at both ends and peaks in the middle.  Different phases + big
  // amplitude make the strands cross over one another → a woven coil; the
  // envelope funnels them back to their nested centres for the loop stack.
  const span      = P2_N * P2_HW;
  const waveEndX  = wx - span;
  const phi       = i * ((2 * Math.PI) / 5);
  const waveParts: string[] = [];
  for (let x = wx - 6; x > waveEndX; x -= 6) {
    const t   = wx - x;                          // distance travelled left (0…span)
    const env = Math.sin((Math.PI * t) / span);  // 0 at ends, 1 in the middle
    const y   = cy + P2_AMP * env * Math.sin((t * Math.PI) / P2_HW + phi);
    waveParts.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
  }
  waveParts.push(`L ${waveEndX},${cy}`);         // land back on the nested centre

  // ── straight run LEFT to this line's own loop drop point ────────────────
  // Different run lengths stagger the otherwise-identical loops into a stack.
  const qx     = P2_LOOP_X[i];   // descent x = rightmost point of this loop
  const qStart = qx + P2_QTR;    // x where the quarter-turn begins
  const runToLoop = `L ${qStart},${cy}`;

  // ── tight quarter-turn LEFT → DOWN ──────────────────────────────────────
  const qy = cy + P2_QTR;        // y after pivot
  const quarterTurn =
    `C ${qStart - P2_QTR*K},${cy} ${qx},${cy + P2_QTR*(1-K)} ${qx},${qy}`;

  return [
    `M ${dx},-10`,
    `L ${dx},${ey}`,
    topTurn,
    ...waveParts,
    runToLoop,
    quarterTurn,
    `L ${qx},${VH + 10}`,   // descend off the bottom (flourish is Phase 2b)
  ].join(" ");
}

/**
 * Phase 2b path for line i (own sticky screen - the coil is scrolled away):
 *   enter from top at this strand's descent x
 *   → 90° arc DOWN→RIGHT → level run
 *   → P2B_N alternating petal loops (up, down, up, down)
 *   → 90° arc RIGHT→DOWN → descend off bottom
 */
function phase2bPath(i: number): string {
  const qx  = P2_LOOP_X[i];
  const qtr = P2_QTR;
  const cc  = P2B_CC + i * 22;   // flourish midline (strands nest downward)
  const yv  = cc - qtr;          // where the down→right turn begins
  const xr  = qx + qtr;          // x right after the turn
  const x0  = xr + P2B_RUN;      // petal chain start x

  // down→right quarter-turn: arrive at (qx,yv) going down, leave (xr,cc) right
  const downToRight =
    `C ${qx},${yv + qtr*K} ${xr - qtr*K},${cc} ${xr},${cc}`;

  // alternating petal loops: each petal is one full garland loop that starts
  // and ends on the midline with a horizontal tangent → smooth stitching.
  const petals: string[] = [];
  for (let k = 0; k < P2B_N; k++) {
    const sgn = k % 2 === 0 ? -1 : 1;        // first petal UP (SVG y-down)
    const xk  = x0 + k * 2 * Math.PI * P2B_M;
    for (let t = 0.08; t <= 2 * Math.PI + 1e-6; t += 0.08) {
      const x = xk + P2B_M * t + P2B_R * Math.sin(t);
      const y = cc + sgn * P2B_R2 * (1 - Math.cos(t));
      petals.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }
  const xe = x0 + P2B_N * 2 * Math.PI * P2B_M; // chain end x (back on midline)
  petals.push(`L ${xe.toFixed(1)},${cc}`);

  // right→down quarter-turn, then descend to the bottom
  const rightToDown =
    `C ${xe + qtr*K},${cc} ${xe + qtr},${cc + qtr*(1-K)} ${xe + qtr},${cc + qtr}`;

  return [
    `M ${qx},-10`,
    `L ${qx},${yv}`,     // vertical entry from the top
    downToRight,          // turn right
    ...petals,            // alternating petal flourish
    rightToDown,          // turn back down
    `L ${(xe + qtr).toFixed(1)},${VH + 10}`,
  ].join(" ");
}

// ── Scroll captions ───────────────────────────────────────────────────────────
const easeC = (t: number) => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };

/** Little narrator text that fades in at `at` (and optionally out at `fadeOut`)
 *  as the phase's scroll progress `p` advances. Position in % of the screen. */
function DrawCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;
    let lastDrawTime = 0;

    // Fade drawn content; hard-clear after 1.5s of no drawing to eliminate ghost traces
    const fade = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      if (lastDrawTime > 0 && performance.now() - lastDrawTime > 1500) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lastDrawTime = 0;
      }
      rafRef.current = requestAnimationFrame(fade);
    };
    rafRef.current = requestAnimationFrame(fade);

    const onDown = (e: MouseEvent) => {
      drawingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: MouseEvent) => {
      if (!drawingRef.current || !lastPosRef.current) return;
      lastDrawTime = performance.now();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(253,246,236,0.85)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { drawingRef.current = false; lastPosRef.current = null; };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 9998,
    }} />
  );
}

function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX - 5}px, ${e.clientY - 5}px, 0)`;
    };
    const hide = () => { el.style.opacity = "0"; };
    const show = () => { el.style.opacity = "1"; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", hide);
    window.addEventListener("mouseenter", show);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", hide);
      window.removeEventListener("mouseenter", show);
    };
  }, []);
  return (
    <div ref={ref} style={{
      position: "fixed", top: 0, left: 0, zIndex: 99999,
      width: "10px", height: "10px",
      background: "#FDF6EC",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.12)",
      pointerEvents: "none", willChange: "transform",
      transform: "translate3d(-100px,-100px,0)",
    }} />
  );
}

function Caption({ p, at, fadeOut, x, y, rot = 0, size = "clamp(1.1rem,2.4vw,2rem)", children }: {
  p: number; at: number; fadeOut?: number; x: string; y: string;
  rot?: number; size?: string; children: React.ReactNode;
}) {
  const on  = easeC((p - at) / 0.06);
  const off = fadeOut === undefined ? 1 : 1 - easeC((p - fadeOut) / 0.06);
  return (
    <div className="absolute z-30 pointer-events-none" style={{
      left: x, top: y, opacity: on * off,
      transform: `translateY(${(1 - on) * 16}px) rotate(${rot}deg)`,
      transformOrigin: "left top",
      fontFamily: "'Poppins',sans-serif", fontStyle: "italic", fontWeight: 400,
      fontSize: size, color: "#000000", letterSpacing: "-0.01em", whiteSpace: "nowrap",
    }}>{children}</div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function App() {
  // Phase 1
  const p1Ref   = useRef<HTMLDivElement>(null);
  const p1Paths = useRef<(SVGPathElement | null)[]>([]);
  const [p1Len, setP1Len] = useState<number[]>([99999,99999,99999,99999,99999]);
  const { scrollYProgress: sp1 } = useScroll({ target: p1Ref, offset: ["start start","end end"] });
  const [p1, setP1] = useState(0);
  useLayoutEffect(() => sp1.on("change", setP1), [sp1]);

  // Phase 3
  const p3Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sp3 } = useScroll({ target: p3Ref, offset: ["start start","end end"] });
  const [p3, setP3] = useState(0);
  useLayoutEffect(() => sp3.on("change", setP3), [sp3]);

  // Phase 2
  const p2Ref   = useRef<HTMLDivElement>(null);
  const p2Paths = useRef<(SVGPathElement | null)[]>([]);
  const [p2Len, setP2Len] = useState<number[]>([99999,99999,99999,99999,99999]);
  const { scrollYProgress: sp2 } = useScroll({ target: p2Ref, offset: ["start start","end end"] });
  const [p2, setP2] = useState(0);
  useLayoutEffect(() => sp2.on("change", setP2), [sp2]);

  // Phase 2b (petal flourish)
  const p2bRef   = useRef<HTMLDivElement>(null);
  const p2bPaths = useRef<(SVGPathElement | null)[]>([]);
  const [p2bLen, setP2bLen] = useState<number[]>([99999,99999,99999,99999,99999]);
  const { scrollYProgress: sp2b } = useScroll({ target: p2bRef, offset: ["start start","end end"] });
  const [p2b, setP2b] = useState(0);
  useLayoutEffect(() => sp2b.on("change", setP2b), [sp2b]);

  useLayoutEffect(() => {
    const m = p1Paths.current.map(el => el?.getTotalLength() ?? 99999);
    if (!m.some(l => l >= 99999))
      setP1Len(prev => m.every((l,i) => Math.abs(l-prev[i]) < 0.5) ? prev : m);
  });
  useLayoutEffect(() => {
    const m = p2Paths.current.map(el => el?.getTotalLength() ?? 99999);
    if (!m.some(l => l >= 99999))
      setP2Len(prev => m.every((l,i) => Math.abs(l-prev[i]) < 0.5) ? prev : m);
  });
  useLayoutEffect(() => {
    const m = p2bPaths.current.map(el => el?.getTotalLength() ?? 99999);
    if (!m.some(l => l >= 99999))
      setP2bLen(prev => m.every((l,i) => Math.abs(l-prev[i]) < 0.5) ? prev : m);
  });

  const nameOpacity = Math.max(0, 1 - p1 * 10);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [hoverSection, setHoverSection]   = useState<number | null>(null);

  // Scroll nudge - appears 2s after load, fades as soon as user scrolls
  const [nudgeVisible, setNudgeVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setNudgeVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);
  const scrollHintOpacity = nudgeVisible ? Math.max(0, 1 - p1 * 25) : 0;

  // Phase 2 draws from the moment it enters - the path starts with the
  // vertical stripe segment so the stripe above the wave is always the
  // "already drawn" portion of the animated path (no static lines needed).
  const waveProgress = p2;

  // Phase 3 - stage 1 (0→0.5): strands land + perspective floor grows.
  //           stage 2 (0.5→1): bars cast UP from floor, then widen to full-bleed; floor fades.
  const ease3 = (t: number) => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };
  const p3s1 = Math.min(1, p3 / 0.5);
  const p3s2 = Math.max(0, (p3 - 0.5) / 0.5);
  const floorGrow      = ease3(p3s1);                 // ray-clip reveal, stage 1
  const barRise        = ease3(p3s2);                 // bar top: VH → 0 (rises from trapezoid base)
  const floorOpacity   = 1 - ease3(p3s2);             // floor fades as bars rise
  const p3LabelOpacity = ease3((p3s2 - 0.75) / 0.25); // labels last

  return (
    <>
      <Cursor />
      <DrawCanvas />
      {/* ── Phase 1: name + M1 knot + M2 wave + M3 descent ── */}
      <div ref={p1Ref} className="relative" style={{ height: "500vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
            style={{ opacity: nameOpacity }}>
            <h1 style={{ fontFamily:"'Poppins',sans-serif", fontStyle:"italic", fontWeight:200,
              fontSize:"clamp(3rem,10vw,8rem)", color:"#000000ff", letterSpacing:"-0.035em", lineHeight:0.92 }}>
              leena dudi
            </h1>
            <a href="mailto:ldudi@mit.edu" style={{
              pointerEvents: "auto",
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontStyle: "italic",
              fontSize: "clamp(0.8rem,1.4vw,1rem)", fontWeight: 400,
              color: "#000000", opacity: 0.55, marginTop: "0.75rem",
              textDecoration: "none", letterSpacing: "0.01em",
            }}>
              ldudi@mit.edu
            </a>
          </div>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">
            {SECTIONS.map((s, i) => {
              const len = p1Len[i];
              return <path key={s.id} ref={el => { p1Paths.current[i] = el; }}
                d={phase1Path(i)} stroke={s.color} strokeWidth={SW}
                fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={len} strokeDashoffset={Math.max(0, len*(1-p1))} />;
            })}
          </svg>
          <Caption p={p1} at={0.1}  x="3%"  y="39%">i love rollercoasters :)</Caption>
          <Caption p={p1} at={0.3}  x="42%" y="65%" rot={-20}>wanna take a ride with me?</Caption>
          <Caption p={p1} at={0.7} x="95%" y="6%"  rot={58} size="clamp(1.2rem,2.4vw,2rem)">weeeee</Caption>
          <div className="absolute bottom-0 left-0 h-px z-40" style={{
            width:`${p1*100}%`,
            background:"linear-gradient(90deg,#34C8C5,#DF84BD,#FC8A8E,#FFAE69,#FEE09D)",
            opacity:Math.min(1,p1*6) }} />

          {/* Scroll nudge - fades in after 2s, vanishes as soon as scrolling starts */}
          <div className="absolute bottom-10 left-1/2 z-30 pointer-events-none flex flex-col items-center gap-2"
            style={{ transform: "translateX(-50%)", opacity: scrollHintOpacity, transition: "opacity 0.5s ease" }}>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem",
              letterSpacing:"0.18em", textTransform:"uppercase", color:"#000000", opacity:0.45 }}>
              scroll
            </span>
            <div style={{ animation: "scroll-nudge-bounce 1.8s ease-in-out infinite" }}>
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                <path d="M2 2L11 11L20 2" stroke="#000000" strokeOpacity="0.4" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

{/* Skip to portfolio - fixed pill, appears after a little scroll, hides once portfolio is live */}
      <button
        onClick={() => {
          const el = p3Ref.current;
          if (!el) return;
          // Columns become visible at p3 ≈ 0.875 - scroll to 96% through Phase 3
          window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.96, behavior: "smooth" });
        }}
        style={{
          position: "fixed", bottom: "1.5rem", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: "rgba(21,72,76,0.82)",
          color: "#FDF6EC",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "2rem",
          padding: "0.5rem 1.35rem",
          fontSize: "0.75rem",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: "0.05em",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          opacity: p1 > 0.06 && p3LabelOpacity < 0.8 ? 1 : 0,
          pointerEvents: p1 > 0.06 && p3LabelOpacity < 0.8 ? "auto" : "none",
          transition: "opacity 0.4s ease",
          whiteSpace: "nowrap",
        }}
      >
        skip to portfolio →
      </button>

      {/* ── Phase 2: right-wall stripes + sinusoidal wave animation ── */}
      <div ref={p2Ref} className="relative" style={{ height: "400vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">

            {/* Continuity with Phase 1: at progress 0 the strands are full-height
                verticals (matching Phase 1's last frame).  Stage 1 (p<δ): the tail
                below the turn retracts upward - still ONE straight line.  Stage 2:
                only then does the tip curve away into the wave.  At every instant
                each strand is a single unbroken line - never cut, never forked. */}
            {SECTIONS.map((s, i) => {
              const len   = p2Len[i];
              const entry = P2_TURN_Y + 10;               // pre-drawn entry length
              const tail  = VH + 10 - P2_TURN_Y;          // tail below the turn
              const DELTA = 0.08;                         // scroll share for the pull-up
              const pullP = Math.min(1, waveProgress / DELTA);
              const waveP = Math.max(0, (waveProgress - DELTA) / (1 - DELTA));
              return <g key={`wave-${s.id}`}>
                <line x1={DX[i]} y1={P2_TURN_Y} x2={DX[i]} y2={VH + 10}
                  stroke={s.color} strokeWidth={SW}
                  strokeDasharray={tail} strokeDashoffset={tail * pullP} />
                <path ref={el => { p2Paths.current[i] = el; }}
                  d={phase2Path(i)} stroke={s.color} strokeWidth={SW}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={len} strokeDashoffset={Math.max(0, (len - entry)*(1-waveP))} />
              </g>;
            })}
          </svg>
          {/* at=-0.06 ⇒ already fully faded in at progress 0, so it's visible
              from the moment the screen slides in (while the lines are still
              vertical), then fades as the wave takes over */}
          <Caption p={p2} at={-0.03} fadeOut={0.1} x="90%" y="8%" rot={90}>breathe in</Caption>
          <Caption p={p2} at={0.25} x="82%" y="22%" rot={-8}>and out</Caption>
          <Caption p={p2} at={0.88} x="20%" y="55%" rot={90}>everyone deserves a break</Caption>
        </div>
      </div>
      {/* ── Phase 2b: cursive petal flourish (coil scrolled away) ── */}
      <div ref={p2bRef} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">
            {/* Same continuity trick as Phase 2: full-height at progress 0, tail
                pulls up first, THEN the flourish draws - one unbroken line. */}
            {SECTIONS.map((s, i) => {
              const len   = p2bLen[i];
              const yv    = P2B_CC + i * 22 - P2_QTR;  // turn y (matches phase2bPath)
              const entry = yv + 10;                    // pre-drawn entry length
              const tail  = VH + 10 - yv;
              const qx    = P2_LOOP_X[i];
              const DELTA = 0.08;                       // scroll share for the pull-up
              const pullP = Math.min(1, p2b / DELTA);
              const flowP = Math.max(0, (p2b - DELTA) / (1 - DELTA));
              return <g key={`flourish-${s.id}`}>
                <line x1={qx} y1={yv} x2={qx} y2={VH + 10}
                  stroke={s.color} strokeWidth={SW}
                  strokeDasharray={tail} strokeDashoffset={tail * pullP} />
                <path ref={el => { p2bPaths.current[i] = el; }}
                  d={phase2bPath(i)} stroke={s.color} strokeWidth={SW}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={len} strokeDashoffset={Math.max(0, (len - entry)*(1-flowP))} />
              </g>;
            })}
          </svg>
          <Caption p={p2b} at={0.5} x="43%" y="26%" rot={34} size="clamp(1.3rem,2.8vw,2.4rem)">woah</Caption>
          <Caption p={p2b} at={0.9} x="63%" y="64%" rot={90}>that was unexpected.</Caption>
        </div>
      </div>

      {/* ── Phase 3: strands land → perspective floor → bars cast up → full-bleed columns ── */}
      <div ref={p3Ref} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">
            <defs>
              {/* perspective rays reveal - grows downward from the floor during stage 1 */}
              <clipPath id="ray-clip">
                <rect x="0" y={FLOOR_Y} width={VW}
                  height={Math.max(0, floorGrow * (VH - FLOOR_Y + 60))} />
              </clipPath>
            </defs>

            {/* Stage 1: descent strands + perspective floor (fades as bars widen) */}
            <g opacity={floorOpacity}>
              {SECTIONS.map((s, i) => (
                <line key={`p3-line-${s.id}`}
                  x1={CONTACT_X[i]} y1={-10}
                  x2={CONTACT_X[i]} y2={FLOOR_Y}
                  stroke={s.color} strokeWidth={SW} strokeLinecap="round" />
              ))}
              <line x1="0" y1={FLOOR_Y} x2={VW} y2={FLOOR_Y}
                stroke="#d8cbb8" strokeWidth="1.5" />
              <g clipPath="url(#ray-clip)">
                {SECTIONS.map((s, i) => {
                  const cx = CONTACT_X[i];
                  const cl = (i * VW) / 5;
                  const cr = ((i + 1) * VW) / 5;
                  return (
                    <path key={`ray-${s.id}`}
                      d={`M ${cx - SW / 2},${FLOOR_Y} L ${cl},${VH} L ${cr},${VH} L ${cx + SW / 2},${FLOOR_Y} Z`}
                      fill={s.color} />
                  );
                })}
              </g>
            </g>

            {/* Stage 2: bars rise UP from the trapezoid's wide base (full column width) */}
            {SECTIONS.map((s, i) => {
              const cl = (i * VW) / 5;
              const cr = ((i + 1) * VW) / 5;
              const top = VH * (1 - barRise); // VH → 0 (rises from the base upward)
              return (
                <rect key={`col-${s.id}`}
                  x={cl} y={top}
                  width={cr - cl} height={VH - top}
                  fill={s.color} />
              );
            })}
          </svg>
          <Caption p={p3} at={0.08} fadeOut={0.52} x="20%"  y="15%">hope you enjoyed the ride!</Caption>
          <Caption p={p3} at={0.3}  fadeOut={0.52} x="65%" y="25%">now more about me…</Caption>

          {/* Interactive column layer - fades in with animation, handles expand/collapse */}
          <div className="absolute inset-0 flex"
            style={{ opacity: p3LabelOpacity, pointerEvents: p3LabelOpacity > 0 ? "auto" : "none" }}>
            {SECTIONS.map((s, i) => {
              const isActive    = activeSection === i;
              const isCollapsed = activeSection !== null && !isActive;
              const isHovered   = hoverSection === i && !isActive;
              const ink         = labelColor(s.color);
              return (
                <div
                  key={`icol-${s.id}`}
                  role={isActive ? undefined : "button"}
                  tabIndex={0}
                  aria-expanded={isActive}
                  onClick={() => setActiveSection(isActive ? null : i)}
                  onKeyDown={({ key, preventDefault }: { key: string; preventDefault(): void }) => {
                    if (key === "Enter" || key === " ") {
                      preventDefault();
                      setActiveSection(isActive ? null : i);
                    }
                  }}
                  onMouseEnter={() => setHoverSection(i)}
                  onMouseLeave={() => setHoverSection(null)}
                  style={{
                    flex: isActive ? 5 : isCollapsed ? 0.28 : 1,
                    background: s.color,
                    overflow: "hidden",
                    cursor: isActive ? "default" : "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "flex 0.48s cubic-bezier(0.4,0,0.2,1), filter 0.18s ease",
                    filter: isHovered ? "brightness(1.12)" : "none",
                    outline: "none",
                  }}
                >
                  {/* Label - big when default, rotated when collapsed */}
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500,
                    letterSpacing: "-0.01em", textTransform: "lowercase",
                    color: ink,
                    pointerEvents: "none",
                    position: "relative", zIndex: 1,
                    whiteSpace: "nowrap",
                    fontSize: isCollapsed ? "clamp(0.6rem,1.1vw,0.85rem)" : "clamp(1.1rem,2.5vw,2.1rem)",
                    opacity: isActive ? 0 : 1,
                    transform: isCollapsed ? "rotate(-90deg)" : "none",
                    transition: "opacity 0.15s ease, transform 0.35s ease, font-size 0.35s ease",
                  }}>
                    {s.title}
                  </span>

                  {/* Expand affordance - visible only in default (not active, not collapsed) state */}
                  {!isActive && !isCollapsed && (
                    <div style={{
                      position: "absolute", bottom: "1.15rem", left: "50%",
                      transform: "translateX(-50%)",
                      pointerEvents: "none",
                      opacity: isHovered ? 0.85 : 0.4,
                      transition: "opacity 0.18s ease",
                    }}>
                      <svg width="16" height="9" viewBox="0 0 16 9" fill="none">
                        <path d="M1 1L8 8L15 1" stroke={ink} strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Expanded content - header + section component */}
                  <motion.div
                    style={{
                      position: "absolute", inset: 0,
                      padding: "clamp(1.25rem,2.6vw,2.25rem)",
                      pointerEvents: isActive ? "auto" : "none",
                      display: "flex", flexDirection: "column", gap: "1rem",
                      color: ink, minHeight: 0,
                    }}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
                    transition={{ duration: 0.26, delay: isActive ? 0.14 : 0, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {i !== 1 && (
                      <div style={{
                        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600,
                        fontSize: "clamp(1.2rem,2.5vw,1.9rem)", letterSpacing: "-0.02em",
                        lineHeight: 1.05, flexShrink: 0,
                      }}>
                        {s.title}
                      </div>
                    )}

                    {i === 0
                      ? <ExperienceSection items={SECTION_CONTENT[i].items} ink={ink} />
                      : i === 1
                      ? <ProjectsSection items={SECTION_CONTENT[i].items} ink={ink} title={s.title} />
                      : i === 2
                      ? <SchoolSection items={SECTION_CONTENT[i].items} ink={ink} />
                      : i === 3
                      ? <ExperienceSection items={SECTION_CONTENT[i].items} ink={ink} />
                      : i === 4
                      ? <HobbiesSection ink={ink} />
                      : <PortfolioItems items={SECTION_CONTENT[i].items} ink={ink} />
                    }
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
