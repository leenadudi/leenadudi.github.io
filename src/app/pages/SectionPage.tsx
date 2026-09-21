/** One page per section: title, that page's ribbon move, then the content. */
import { Navigate, useParams } from "react-router";
import { SECTIONS, SECTION_CONTENT } from "../content";
import { Container, PageTitle } from "../components/Layout";
import Ribbon from "../components/Ribbon";
import EntryList from "../components/EntryList";
import ProjectList from "../components/ProjectList";
import SchoolPage from "../components/SchoolPage";
import HobbiesSection from "../components/HobbiesSection";

const LEDE: Record<string, string> = {
  experience: "Internships in software engineering, climate data research, and financial analysis.",
  projects:   "Things I built because I wanted them to exist.",
  school:     "MIT, and the research and design challenges I have worked on there.",
  service:    "Tutoring, STEM outreach, and the organizations I have helped run.",
  hobbies:    "Off the clock.",
};

export default function SectionPage() {
  const { section } = useParams();
  const idx = SECTIONS.findIndex(s => s.id === section);
  if (idx < 0) return <Navigate to="/" replace />;
  const s = SECTIONS[idx];
  const items = SECTION_CONTENT[idx].items;

  return (
    <>
      <PageTitle title={s.title} lede={LEDE[s.id]} />
      <div style={{ margin: "0.5rem 0 clamp(1.5rem, 4vw, 3rem)" }}>
        <Ribbon move={s.move} emphasis={s.id} />
      </div>
      <Container>
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
