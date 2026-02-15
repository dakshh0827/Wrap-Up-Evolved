import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import axios from "axios";
import { 
  Brain, Sparkles, Search, TrendingUp, BarChart3, 
  Globe, Zap, Database, Shield, ArrowRight, Link2 
} from "lucide-react";

const API_BASE = 'http://localhost:5000/api';

export default function ResearchLandingPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("idle"); // idle, searching, analyzing, complete
  const navigate = useNavigate();

  const handleResearch = async (e) => {
    e.preventDefault();
    
    if (!topic.trim() || topic.trim().length < 5) {
      toast.error("Please enter a topic (at least 5 characters)");
      return;
    }

    setLoading(true);
    setStage("searching");
    
    const loadingToast = toast.loading("Initializing AI research engine...");

    try {
      // Simulate searching phase to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 1: Generate research report
      setStage("analyzing");
      toast.loading("Analyzing multiple sources...", { id: loadingToast });
      
      const response = await axios.post(`${API_BASE}/research/generate`, {
        topic: topic.trim()
      });

      setStage("complete");
      toast.success("Research complete!", { id: loadingToast });

      // Navigate to research report page
      setTimeout(() => {
        navigate(`/research/${response.data.researchId}`);
      }, 500);

    } catch (error) {
      console.error("Research error:", error);
      toast.error(
        error.response?.data?.error || "Research failed. Please try again.",
        { id: loadingToast }
      );
      setStage("idle");
    } finally {
      setLoading(false);
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case "searching":
        return "🔍 Searching across 10+ platforms...";
      case "analyzing":
        return "🧠 Analyzing sources and synthesizing insights...";
      case "complete":
        return "✅ Research complete! Redirecting...";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 via-transparent to-purple-500/5"></div>
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Navbar />

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-16 pt-12">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#10b981]" />
            <span className="text-sm font-mono text-[#10b981]">Powered by AI</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">
            Multi-Source
            <br />
            <span className="bg-gradient-to-r from-[#10b981] to-emerald-400 bg-clip-text text-transparent">
              Research Engine
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Get comprehensive, AI-synthesized research reports from 10+ authoritative sources. 
            Identify consensus, contradictions, and insights in seconds.
          </p>

          {/* Main Input */}
          <form onSubmit={handleResearch} className="mb-12">
            <div className="bg-[#121214] border-2 border-[#27272a] rounded-2xl p-3 max-w-3xl mx-auto hover:border-[#10b981]/50 transition-all duration-300 focus-within:border-[#10b981] shadow-2xl shadow-black/30">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Brain className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your research topic... (e.g., 'Impact of AI on healthcare')"
                    className="w-full bg-transparent pl-12 pr-4 py-4 text-lg text-white placeholder-zinc-600 focus:outline-none"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || topic.trim().length < 5}
                  className="bg-[#10b981] hover:bg-[#059669] text-black px-8 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-black rounded-full border-t-transparent"></div>
                      <span>Researching...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Report</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stage Indicator */}
            {loading && (
              <div className="mt-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-[#18181b] border border-[#27272a] px-6 py-3 rounded-full">
                  <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono text-zinc-400">{getStageMessage()}</span>
                </div>
              </div>
            )}
          </form>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/research-list")}
              className="group flex items-center justify-center gap-2 text-white hover:text-[#10b981] transition-colors text-sm font-medium border border-[#10b981]/30 hover:border-[#10b981] px-6 py-3 rounded-lg bg-[#10b981]/5"
            >
              <Brain className="w-4 h-4" />
              <span>Browse Research Reports</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate("/legacy")}
              className="group flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium border border-[#27272a] hover:border-zinc-600 px-6 py-3 rounded-lg"
            >
              <Link2 className="w-4 h-4" />
              <span>Legacy: Link-Based Curation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Globe,
              title: "10+ Source Platforms",
              description: "Web, Twitter, Reddit, News, Academic papers, and more",
              color: "text-blue-400",
              borderColor: "border-blue-400/20"
            },
            {
              icon: BarChart3,
              title: "Visual Intelligence",
              description: "Sentiment analysis, source comparisons, credibility scoring",
              color: "text-purple-400",
              borderColor: "border-purple-400/20"
            },
            {
              icon: Database,
              title: "Consensus Mapping",
              description: "Identify agreements, debates, and minority perspectives",
              color: "text-[#10b981]",
              borderColor: "border-[#10b981]/20"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`group bg-[#121214] border ${feature.borderColor} hover:border-opacity-50 rounded-xl p-8 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="w-14 h-14 bg-[#18181b] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Search", desc: "AI searches 10+ platforms", icon: Search },
              { step: "02", title: "Extract", desc: "Clean content extraction", icon: Zap },
              { step: "03", title: "Analyze", desc: "Deep AI analysis", icon: Brain },
              { step: "04", title: "Synthesize", desc: "Comprehensive report", icon: TrendingUp }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#18181b] border border-[#27272a] rounded-full flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-[#10b981]" />
                </div>
                <div className="text-xs font-mono text-zinc-600 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto bg-[#121214] border border-[#27272a] rounded-xl p-8 text-center">
          <Shield className="w-12 h-12 text-[#10b981] mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">Credibility & Transparency</h3>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            All sources are cited with full URLs. Reports include credibility disclaimers 
            and evidence quality assessments. No content is plagiarized—everything is synthesized.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}