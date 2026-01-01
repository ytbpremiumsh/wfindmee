import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import Quizzes from "./pages/Quizzes";
import QuizDetail from "./pages/QuizDetail";
import QuizTerms from "./pages/QuizTerms";
import QuizPlay from "./pages/QuizPlay";
import QuizIframe from "./pages/QuizIframe";
import QuizResult from "./pages/QuizResult";
import About from "./pages/About";
import ArticleDetail from "./pages/ArticleDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminQuizQuestions from "./pages/admin/AdminQuizQuestions";
import AdminQuizResults from "./pages/admin/AdminQuizResults";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminContent from "./pages/admin/AdminContent";
import NotFound from "./pages/NotFound";
import { StickyAd } from "./components/ads/StickyAd";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Index /><StickyAd /></>} />
            <Route path="/quizzes" element={<><Quizzes /><StickyAd /></>} />
            <Route path="/quiz/:id" element={<><QuizDetail /><StickyAd /></>} />
            <Route path="/quiz/:id/terms" element={<><QuizTerms /><StickyAd /></>} />
            <Route path="/quiz/:id/play" element={<><QuizPlay /><StickyAd /></>} />
            <Route path="/quiz/:id/iframe" element={<><QuizIframe /><StickyAd /></>} />
            <Route path="/quiz/:id/result" element={<><QuizResult /><StickyAd /></>} />
            <Route path="/about" element={<><About /><StickyAd /></>} />
            <Route path="/artikel/:slug" element={<><ArticleDetail /><StickyAd /></>} />
            
            {/* Admin Routes - No Sticky Ad */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/quizzes" element={
              <ProtectedRoute requireAdmin>
                <AdminQuizzes />
              </ProtectedRoute>
            } />
            <Route path="/admin/quizzes/:quizId/questions" element={
              <ProtectedRoute requireAdmin>
                <AdminQuizQuestions />
              </ProtectedRoute>
            } />
            <Route path="/admin/quizzes/:quizId/results" element={
              <ProtectedRoute requireAdmin>
                <AdminQuizResults />
              </ProtectedRoute>
            } />
            <Route path="/admin/articles" element={
              <ProtectedRoute requireAdmin>
                <AdminArticles />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/content" element={
              <ProtectedRoute requireAdmin>
                <AdminContent />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
