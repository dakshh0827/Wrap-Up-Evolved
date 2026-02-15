import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ResearchLandingPage from "./pages/ResearchLandingPage";
import ResearchReportPage from "./pages/ResearchReportPage";
import AllResearchPage from "./pages/AllResearchPage"; // NEW
import LegacyLandingPage from "./pages/LegacyLandingPage";
import CuratedArticlesPage from "./pages/CuratedArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailsPage";

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#171717',
            color: '#e5e5e5',
            border: '1px solid #404040',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-[#0A0A0A]">
        <Routes>
          {/* AI Research Engine (Primary) */}
          <Route path="/" element={<ResearchLandingPage />} />
          <Route path="/research/:id" element={<ResearchReportPage />} />
          <Route path="/research-list" element={<AllResearchPage />} /> {/* NEW */}
          
          {/* Legacy Link-Based Curation */}
          <Route path="/legacy" element={<LegacyLandingPage />} />
          <Route path="/curated" element={<CuratedArticlesPage />} />
          <Route path="/curated/:id" element={<ArticleDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;