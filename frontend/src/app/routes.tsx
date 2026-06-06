import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { FormPage } from "./pages/FormPage";
import { ResultsPage } from "./pages/ResultsPage";
import { MyInfoPage } from "./pages/MyInfoPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
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
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/auth/callback",
        Component: AuthCallbackPage,
      },
      {
        path: "/privacy",
        Component: PrivacyPage,
      },
      {
        path: "/terms",
        Component: TermsPage,
      },
    ],
  },
]);