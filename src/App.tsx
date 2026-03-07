import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Article from "./pages/Article";
import Productivity from "./pages/Productivity";
import Lifestyle from "./pages/Lifestyle";
import TechTips from "./pages/TechTips";
import Growth from "./pages/Growth";
import About from "./pages/About";
import Authors from "./pages/Authors";
import Contact from "./pages/Contact";
import StyleGuide from "./pages/StyleGuide";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ManageArticles from "./pages/ManageArticles";
import ManageUsers from "./pages/ManageUsers";
import ManageSubscribers from "./pages/ManageSubscribers";
import ArticleEditor from "./pages/ArticleEditor";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/productivity" element={<Productivity />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/tech-tips" element={<TechTips />} />
            <Route path="/growth" element={<Growth />} />
            <Route path="/about" element={<About />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/style-guide" element={<StyleGuide />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage" element={<Navigate to="/manage/articles" replace />} />
            <Route path="/manage/articles" element={<ManageArticles />} />
            <Route path="/manage/users" element={<ManageUsers />} />
            <Route path="/manage/subscribers" element={<ManageSubscribers />} />
            <Route path="/manage/new" element={<ArticleEditor />} />
            <Route path="/manage/edit/:id" element={<ArticleEditor />} />
            <Route path="/search" element={<Search />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
