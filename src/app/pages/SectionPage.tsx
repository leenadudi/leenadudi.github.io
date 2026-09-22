/** One page per section. */
import { Navigate, useParams } from "react-router";
import { SECTIONS, SECTION_CONTENT } from "../content";
import { Container, PageTitle } from "../components/Layout";
import EntryList from "../components/EntryList";
import ProjectList from "../components/ProjectList";
import SchoolPage from "../components/SchoolPage";
import HobbiesSection from "../components/HobbiesSection";

export default function SectionPage() {
  const { section } = useParams();
  const idx = SECTIONS.findIndex(s => s.id === section);
  if (idx < 0) return <Navigate to="/" replace />;
  const s = SECTIONS[idx];
  const items = SECTION_CONTENT[idx].items;

  return (
    <>
      <PageTitle title={s.title} color={s.color} />
      <Container style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        {s.id === "experience" || s.id === "service" ? (
          <EntryList items={items} color={s.color} />
        ) : s.id === "projects" ? (
          <ProjectList items={items} color={s.color} />
        ) : s.id === "school" ? (
          <SchoolPage items={items} color={s.color} />
        ) : (
          <HobbiesSection color={s.color} />
        )}
      </Container>
    </>
  );
}
