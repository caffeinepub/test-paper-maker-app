import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AppShell } from './components/layout/AppShell';
import { LoginWireframe } from './pages/auth/LoginWireframe';
import { ProfileWireframe } from './pages/profile/ProfileWireframe';
import { OnboardingWireframe } from './pages/onboarding/OnboardingWireframe';
import { HomeDashboardWireframe } from './pages/home/HomeDashboardWireframe';
import { GeneratedPapersWireframe } from './pages/papers/GeneratedPapersWireframe';
import { PaperEditorWireframe } from './pages/editor/PaperEditorWireframe';
import { QuestionEntryWireframe } from './pages/editor/QuestionEntryWireframe';
import { RealPaperEditorWireframe } from './pages/editor/RealPaperEditorWireframe';
import { QuestionBankWireframe } from './pages/questionBank/QuestionBankWireframe';
import { AIPreferencesWireframe } from './pages/ai/AIPreferencesWireframe';
import { ExportPrintPreviewWireframe } from './pages/export/ExportPrintPreviewWireframe';
import { OCRUploadWireframe } from './pages/ocr/OCRUploadWireframe';
import { OCRReviewApproveWireframe } from './pages/ocr/OCRReviewApproveWireframe';
import { SettingsWireframe } from './pages/settings/SettingsWireframe';
import { DraftWireframe } from './pages/draft/DraftWireframe';
import { MockStoreProvider } from './state/mockStore';
import { AppErrorBoundary } from './components/errors/AppErrorBoundary';

const rootRoute = createRootRoute({
  component: AppShell,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginWireframe,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingWireframe,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomeDashboardWireframe,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfileWireframe,
});

const papersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/papers',
  component: GeneratedPapersWireframe,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor/$paperId',
  component: PaperEditorWireframe,
});

const realPaperEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor/$paperId/real-paper',
  component: RealPaperEditorWireframe,
});

const questionEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor/$paperId/question',
  component: QuestionEntryWireframe,
});

const questionBankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/question-bank',
  component: QuestionBankWireframe,
});

const aiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai',
  component: AIPreferencesWireframe,
});

const exportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/export/$paperId',
  component: ExportPrintPreviewWireframe,
});

const ocrUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ocr/upload',
  component: OCRUploadWireframe,
});

const ocrReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ocr/review',
  component: OCRReviewApproveWireframe,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsWireframe,
});

const draftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/draft',
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
  aiRoute,
  exportRoute,
  ocrUploadRoute,
  ocrReviewRoute,
  settingsRoute,
  draftRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <MockStoreProvider>
        <RouterProvider router={router} />
      </MockStoreProvider>
    </AppErrorBoundary>
  );
}
