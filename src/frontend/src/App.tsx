import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { AppErrorBoundary } from "./components/errors/AppErrorBoundary";
import { AppShell } from "./components/layout/AppShell";
import { SplashScreen } from "./components/splash/SplashScreen";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { AIPreferencesWireframe } from "./pages/ai/AIPreferencesWireframe";
import { LoginWireframe } from "./pages/auth/LoginWireframe";
import { DraftWireframe } from "./pages/draft/DraftWireframe";
import { PaperEditorWireframe } from "./pages/editor/PaperEditorWireframe";
import { QuestionEntryWireframe } from "./pages/editor/QuestionEntryWireframe";
import { RealPaperEditorWireframe } from "./pages/editor/RealPaperEditorWireframe";
import { ExportPrintPreviewWireframe } from "./pages/export/ExportPrintPreviewWireframe";
import { SharedPaperViewWireframe } from "./pages/export/SharedPaperViewWireframe";
import { HomeDashboardWireframe } from "./pages/home/HomeDashboardWireframe";
import { OCRReviewApproveWireframe } from "./pages/ocr/OCRReviewApproveWireframe";
import { OCRUploadWireframe } from "./pages/ocr/OCRUploadWireframe";
import { OnboardingWireframe } from "./pages/onboarding/OnboardingWireframe";
import { GeneratedPapersWireframe } from "./pages/papers/GeneratedPapersWireframe";
import { ProfileWireframe } from "./pages/profile/ProfileWireframe";
import { AddQuestionsWireframe } from "./pages/questionBank/AddQuestionsWireframe";
import { QuestionBankBoardStandardWireframe } from "./pages/questionBank/QuestionBankBoardStandardWireframe";
import { QuestionBankSubjectsWireframe } from "./pages/questionBank/QuestionBankSubjectsWireframe";
import { QuestionBankWireframe } from "./pages/questionBank/QuestionBankWireframe";
import { SettingsWireframe } from "./pages/settings/SettingsWireframe";
import { MockStoreProvider } from "./state/mockStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <AppErrorBoundary>
      <MockStoreProvider>
        <AppShell />
      </MockStoreProvider>
    </AppErrorBoundary>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginWireframe,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingWireframe,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: HomeDashboardWireframe,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileWireframe,
});

const papersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/papers",
  component: GeneratedPapersWireframe,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor/$paperId",
  component: PaperEditorWireframe,
});

const realPaperEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor/$paperId/real-paper",
  component: RealPaperEditorWireframe,
});

const questionEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor/$paperId/question-entry",
  component: QuestionEntryWireframe,
});

const questionBankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/question-bank",
  component: QuestionBankWireframe,
});

const questionBankSubjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/question-bank/$board/$standardId/subjects",
  component: QuestionBankSubjectsWireframe,
});

const questionBankBoardStandardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/question-bank/$board/$standardId/subjects/$subjectId",
  component: QuestionBankBoardStandardWireframe,
});

const addQuestionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-questions",
  component: AddQuestionsWireframe,
});

const aiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai",
  component: AIPreferencesWireframe,
});

const exportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/export/$paperId",
  component: ExportPrintPreviewWireframe,
});

const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/share/$shareId",
  component: SharedPaperViewWireframe,
});

const ocrUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ocr/upload",
  component: OCRUploadWireframe,
});

const ocrReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ocr/review",
  component: OCRReviewApproveWireframe,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsWireframe,
});

const draftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/draft",
  component: DraftWireframe,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  onboardingRoute,
  homeRoute,
  profileRoute,
  papersRoute,
  editorRoute,
  realPaperEditorRoute,
  questionEntryRoute,
  questionBankRoute,
  questionBankSubjectsRoute,
  questionBankBoardStandardRoute,
  addQuestionsRoute,
  aiRoute,
  exportRoute,
  shareRoute,
  ocrUploadRoute,
  ocrReviewRoute,
  settingsRoute,
  draftRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {!showSplash && (
        <QueryClientProvider client={queryClient}>
          <InternetIdentityProvider>
            <RouterProvider router={router} />
          </InternetIdentityProvider>
        </QueryClientProvider>
      )}
    </>
  );
}

export default App;
