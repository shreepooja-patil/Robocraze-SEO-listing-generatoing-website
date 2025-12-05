import React, { useState } from 'react';
import { AppTab } from './types';
import ListingGenerator from './components/ListingGenerator';
import CompetitorAnalysisComp from './components/CompetitorAnalysis';
import CategoryManager from './components/CategoryManager';
import { PenTool, TrendingUp, Layers, Cpu, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LISTING);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header with Blue Gradient */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 animate-gradient-shift text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            {/* Logo Container - slides in from right */}
            <div className="relative animate-flow-right" style={{ animationDelay: '100ms' }}>
                <div className="animate-float">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Cpu className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    </div>
                </div>
            </div>
            
            {/* Text Container - slides in from right with delay */}
            <div className="animate-flow-right" style={{ animationDelay: '250ms' }}>
                <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
                RoboCraze
                </h1>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-100 opacity-90">
                    SEO & Content Architect
                </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs - Floating overlap style */}
        <div className="max-w-6xl mx-auto px-4 mt-2">
            <nav className="flex space-x-2 animate-flow-right" style={{ animationDelay: '400ms' }}>
                <TabButton 
                    isActive={activeTab === AppTab.LISTING} 
                    onClick={() => setActiveTab(AppTab.LISTING)}
                    icon={<PenTool className="w-4 h-4" />}
                    label="Listing Generator"
                />
                <TabButton 
                    isActive={activeTab === AppTab.COMPETITOR} 
                    onClick={() => setActiveTab(AppTab.COMPETITOR)}
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Competitor Analysis"
                />
                <TabButton 
                    isActive={activeTab === AppTab.CATEGORY} 
                    onClick={() => setActiveTab(AppTab.CATEGORY)}
                    icon={<Layers className="w-4 h-4" />}
                    label="Category Manager"
                />
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="transition-all duration-300 ease-in-out">
            {activeTab === AppTab.LISTING && (
                <div className="animate-fade-in">
                    <ListingGenerator />
                </div>
            )}
            {activeTab === AppTab.COMPETITOR && (
                <div className="animate-fade-in">
                    <CompetitorAnalysisComp />
                </div>
            )}
            {activeTab === AppTab.CATEGORY && (
                <div className="animate-fade-in">
                    <CategoryManager />
                </div>
            )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto py-8 text-center">
          <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
              <p className="text-slate-500 text-sm font-medium">Built with ❤️ for Robocraze</p>
              <p className="text-xs text-slate-400">Powered by Google Gemini 2.5 Flash</p>
          </div>
      </footer>
    </div>
  );
};

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`
            pb-3 pt-3 px-6 text-sm font-medium rounded-t-lg transition-all duration-200 flex items-center gap-2 relative overflow-hidden group
            ${isActive 
                ? 'bg-slate-50 text-blue-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] translate-y-[1px]' 
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }
        `}
    >
        <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'scale-105' : 'group-hover:scale-105'} transition-transform`}>
            {icon} {label}
        </span>
        {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
    </button>
);

export default App;