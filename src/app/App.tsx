import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";
import Ride from "./Ride";
import { useNarrow } from "./hooks/useMediaQuery";

export type { Item, Media, Activity, Award } from "./content";
export { SECTIONS, SECTION_CONTENT } from "./content";

/** The rollercoaster intro is desktop and tablet only. */
function RideRoute() {
  const narrow = useNarrow();
  return narrow ? <Navigate to="/" replace /> : <Ride />;
}

const router = createBrowserRouter([
  { path: "/ride", element: <RideRoute /> },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/:section", element: <SectionPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
