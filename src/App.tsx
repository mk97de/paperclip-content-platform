import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";

import {
  Inbox,
  Heart,
  MessageSquare,
  Trash2,
  Kanban,
  Calendar as CalendarIcon,
  Archive,
  BarChart3,
  Microscope,
  LineChart,
  Brain,
  Search,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

import { Login } from "./pages/login";
import {
  IdeasList,
  IdeasLiked,
  IdeasCommented,
  IdeasDismissed,
} from "./pages/ideas";
import { PipelineList } from "./pages/pipeline";
import { CalendarList } from "./pages/calendar";
import { ArchiveList } from "./pages/archive";
import {
  InsightsPerformance,
  InsightsAnalyse,
  InsightsReport,
  InsightsLearnings,
} from "./pages/insights";
import { TrendsScraped, TrendsTop } from "./pages/trends";
import { HilfePatterns } from "./pages/hilfe";

import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { Layout } from "./components/refine-ui/layout/layout";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { authProvider, dataProvider } from "./providers/directus";
import "./App.css";

const ROUTE_TITLES: Record<string, string> = {
  "/ideas": "Inbox",
  "/ideas/liked": "Gefällt mir",
  "/ideas/commented": "Kommentiert",
  "/ideas/dismissed": "Verworfen",
  "/pipeline": "Pipeline",
  "/calendar": "Kalender",
  "/archive": "Archiv",
  "/insights/performance": "Performance",
  "/insights/analyse": "Analyse",
  "/insights/report": "Weekly Report",
  "/insights/learnings": "Agent Learnings",
  "/trends/scraped": "Scraped Hooks",
  "/trends/top": "Top Performer",
  "/hilfe/patterns": "Hook-Patterns",
  "/login": "Login",
};

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider defaultTheme="dark">
          <DevtoolsProvider>
            <Refine
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              dataProvider={{ default: dataProvider }}
              authProvider={authProvider}
              resources={[
                // --- IDEEN ---
                {
                  name: "ideen-group",
                  meta: { label: "Ideen", group: true },
                },
                {
                  name: "hook_ideas",
                  list: "/ideas",
                  meta: {
                    label: "Inbox",
                    icon: <Inbox className="h-4 w-4" />,
                    parent: "ideen-group",
                  },
                },
                {
                  name: "ideas-liked",
                  list: "/ideas/liked",
                  meta: {
                    label: "Gefällt mir",
                    icon: <Heart className="h-4 w-4" />,
                    parent: "ideen-group",
                  },
                },
                {
                  name: "ideas-commented",
                  list: "/ideas/commented",
                  meta: {
                    label: "Kommentiert",
                    icon: <MessageSquare className="h-4 w-4" />,
                    parent: "ideen-group",
                  },
                },
                {
                  name: "ideas-dismissed",
                  list: "/ideas/dismissed",
                  meta: {
                    label: "Verworfen",
                    icon: <Trash2 className="h-4 w-4" />,
                    parent: "ideen-group",
                  },
                },
                // --- CONTENT ---
                {
                  name: "content-group",
                  meta: { label: "Content", group: true },
                },
                {
                  name: "pipeline",
                  list: "/pipeline",
                  meta: {
                    label: "Pipeline",
                    icon: <Kanban className="h-4 w-4" />,
                    parent: "content-group",
                  },
                },
                {
                  name: "calendar",
                  list: "/calendar",
                  meta: {
                    label: "Kalender",
                    icon: <CalendarIcon className="h-4 w-4" />,
                    parent: "content-group",
                  },
                },
                {
                  name: "archive",
                  list: "/archive",
                  meta: {
                    label: "Archiv",
                    icon: <Archive className="h-4 w-4" />,
                    parent: "content-group",
                  },
                },
                // --- INSIGHTS ---
                {
                  name: "insights-group",
                  meta: { label: "Insights", group: true },
                },
                {
                  name: "insights-performance",
                  list: "/insights/performance",
                  meta: {
                    label: "Performance",
                    icon: <BarChart3 className="h-4 w-4" />,
                    parent: "insights-group",
                  },
                },
                {
                  name: "insights-analyse",
                  list: "/insights/analyse",
                  meta: {
                    label: "Analyse",
                    icon: <Microscope className="h-4 w-4" />,
                    parent: "insights-group",
                  },
                },
                {
                  name: "insights-report",
                  list: "/insights/report",
                  meta: {
                    label: "Weekly Report",
                    icon: <LineChart className="h-4 w-4" />,
                    parent: "insights-group",
                  },
                },
                {
                  name: "insights-learnings",
                  list: "/insights/learnings",
                  meta: {
                    label: "Agent Learnings",
                    icon: <Brain className="h-4 w-4" />,
                    parent: "insights-group",
                  },
                },
                // --- TRENDS ---
                {
                  name: "trends-group",
                  meta: { label: "Trends", group: true },
                },
                {
                  name: "trends-scraped",
                  list: "/trends/scraped",
                  meta: {
                    label: "Scraped Hooks",
                    icon: <Search className="h-4 w-4" />,
                    parent: "trends-group",
                  },
                },
                {
                  name: "trends-top",
                  list: "/trends/top",
                  meta: {
                    label: "Top Performer",
                    icon: <TrendingUp className="h-4 w-4" />,
                    parent: "trends-group",
                  },
                },
                // --- HILFE (not grouped; single link at bottom) ---
                {
                  name: "hilfe-patterns",
                  list: "/hilfe/patterns",
                  meta: {
                    label: "Hook-Patterns",
                    icon: <HelpCircle className="h-4 w-4" />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                title: { text: "Paperclip Content" },
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-routes"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="hook_ideas" />}
                  />
                  <Route path="/ideas" element={<IdeasList />} />
                  <Route path="/ideas/liked" element={<IdeasLiked />} />
                  <Route path="/ideas/commented" element={<IdeasCommented />} />
                  <Route path="/ideas/dismissed" element={<IdeasDismissed />} />
                  <Route path="/pipeline" element={<PipelineList />} />
                  <Route path="/calendar" element={<CalendarList />} />
                  <Route path="/archive" element={<ArchiveList />} />
                  <Route
                    path="/insights/performance"
                    element={<InsightsPerformance />}
                  />
                  <Route path="/insights/analyse" element={<InsightsAnalyse />} />
                  <Route path="/insights/report" element={<InsightsReport />} />
                  <Route
                    path="/insights/learnings"
                    element={<InsightsLearnings />}
                  />
                  <Route path="/trends/scraped" element={<TrendsScraped />} />
                  <Route path="/trends/top" element={<TrendsTop />} />
                  <Route path="/hilfe/patterns" element={<HilfePatterns />} />
                  <Route path="*" element={<ErrorComponent />} />
                </Route>

                <Route
                  element={
                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                      <NavigateToResource resource="hook_ideas" />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                </Route>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler
                handler={({ pathname }) => {
                  const label = ROUTE_TITLES[pathname ?? ""] ?? "";
                  return label ? `${label} · Paperclip Content` : "Paperclip Content";
                }}
              />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
