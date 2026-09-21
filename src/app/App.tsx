import { useEffect, useState } from "react";
import Site from "./Site";
import Ride from "./Ride";
import { useNarrow } from "./hooks/useMediaQuery";

export type { Item, Media, Activity, Award } from "./content";
export { SECTIONS, SECTION_CONTENT } from "./content";

/** Root: the main page by default; the rollercoaster intro at #ride (desktop only). */
export default function App() {
  const narrow = useNarrow();
  const [hash, setHash] = useState(() => (typeof window !== "undefined" ? window.location.hash : ""));

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return hash === "#ride" && !narrow ? <Ride /> : <Site />;
}
