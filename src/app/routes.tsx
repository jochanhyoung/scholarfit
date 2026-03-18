import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { FormPage } from "./pages/FormPage";
import { ResultsPage } from "./pages/ResultsPage";
import { MyInfoPage } from "./pages/MyInfoPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/form",
    Component: FormPage,
  },
  {
    path: "/results",
    Component: ResultsPage,
  },
  {
    path: "/my-info",
    Component: MyInfoPage,
  },
]);