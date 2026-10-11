/** One page per section. */
import { Link, Navigate, useParams } from "react-router";
import { SECTIONS, SECTION_CONTENT } from "../content";
import { Container, PageTitle, Strands } from "../components/Layout";
import { useNarrow } from "../hooks/useMediaQuery";
import { FONT_DISPLAY, INK, LINE } from "../lib/tokens";
import Timeline from "../components/Timeline";
import ServiceTiles from "../components/ServiceTiles";
import ProjectList from "../components/ProjectList";
import SchoolPage from "../components/SchoolPage";
import HobbiesSection from "../components/HobbiesSection";

export default function SectionPage() {
  const { section } = useParams();
  const narrow = useNarrow();
  const idx = SECTIONS.findIndex(s => s.id === section);
  if (idx < 0) return <Navigate to="/" replace />;
  const s = SECTIONS[idx];
  const items = SECTION_CONTENT[idx].items;

  return (
    <>
      <PageTitle title={s.title} id={s.id} />
      <Container style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        {s.id === "experience" ? (
          <Timeline items={items} color={s.color} />
        ) : s.id === "service" ? (
          <ServiceTiles items={items} color={s.color} />
        ) : s.id === "projects" ? (
          <ProjectList items={items} color={s.color} />
        ) : s.id === "school" ? (
          <SchoolPage items={items} color={s.color} />
        ) : (
          <HobbiesSection color={s.color} />
        )}
        {!narrow && <Link to="/ride" className="next-section" style={{
          display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "clamp(2.5rem, 6vw, 4rem)",
          paddingTop: "1.75rem", borderTop: `1px solid ${LINE}`, textDecoration: "none", color: INK,
        }}>
          <Strands width="clamp(5rem, 14vw, 9rem)" />
          <span style={{
            fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 200,
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>
            wanna take the ride?
          </span>
        </Link>}
      </Container>
    </>
  );
}
