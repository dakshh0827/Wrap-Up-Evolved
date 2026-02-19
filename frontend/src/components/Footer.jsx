import React from "react";
import { Link } from "react-router-dom";
import { Layers, Twitter, MessageCircle, Github, Hexagon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-[#27272a] mt-24 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-180">
                <img src="/logo.png" alt="logo" width={40} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Wrap-Up
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              The decentralized curation layer for the Web3 ecosystem. Verified, transparent, and built on Arbitrum.
            </p>
            <div className="flex gap-4">
              {[Twitter, MessageCircle, Github].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 border border-[#27272a] rounded-lg flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#10b981] hover:border-[#10b981] transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            { title: "Platform", links: ["Home", "Curated Articles", "Leaderboard"] },
            { title: "Resources", links: ["Documentation", "FAQ", "Terms of Service"] },
            { title: "Network", links: ["Arbitrum Status", "Contract", "Governance"] }
          ].map((column, idx) => (
            <div key={idx}>
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href="#" className="text-zinc-500 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                      <Hexagon className="w-2 h-2 text-[#27272a] group-hover:text-[#10b981] transition-colors" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#27272a] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs font-medium uppercase tracking-wide">
            © {new Date().getFullYear()} Wrap-Up Decentralized.
          </p>
          <div className="flex items-center gap-2 bg-[#121214] border border-[#27272a] px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span className="text-zinc-400 text-xs font-mono">Arbitrum Testnet: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
