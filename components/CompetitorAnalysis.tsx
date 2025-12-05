import React, { useState } from 'react';
import { findCompetitors } from '../services/geminiService';
import { CompetitorAnalysis } from '../types';
import { Loader2, ExternalLink, Search, TrendingUp, AlertCircle, IndianRupee } from 'lucide-react';

const CompetitorAnalysisComp: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompetitorAnalysis[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const presets = ["Ai-WB2-32S NodeMCU", "XR2206 Signal Generator DIY Kit"];

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setHasSearched(true);
    // Note: Not clearing results immediately to avoid flicker
    try {
      const data = await findCompetitors(searchTerm);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Search Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
         <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 text-slate-800 flex items-center gap-3">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                </span>
                2. Competitor Intelligence
            </h2>
            <p className="text-slate-500 text-sm mb-6 ml-12">
                Analyze listings from Robu, ThinkRobotics, and others to find what makes them stand out.
            </p>
            
            <div className="flex flex-col gap-4">
                <div className="relative group">
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none placeholder:text-slate-400 shadow-sm transition-all text-lg"
                        placeholder="Enter Product Name for Analysis..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    
                    <button 
                        onClick={handleSearch}
                        disabled={loading || !searchTerm}
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md hover:shadow-lg active:scale-95 transform duration-100"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Analyze'}
                    </button>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 font-medium">Trending:</span>
                    <div className="flex gap-2">
                        {presets.map(p => (
                            <button 
                                key={p}
                                onClick={() => setSearchTerm(p)}
                                className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-100 border border-blue-100 transition-colors"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
         </div>
      </div>

      {loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium">Scouting competitor websites...</p>
            <p className="text-sm text-slate-400">Comparing prices and features</p>
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
         <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 animate-fade-in">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-slate-700 font-bold mb-1">No Listings Found</h3>
             <p className="text-slate-500 text-sm max-w-md mx-auto">
                 We couldn't find exact matches on major competitor sites. Try shortening the product name.
             </p>
         </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {results.map((comp, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-pop-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="bg-gradient-to-r from-slate-50 to-white p-5 border-b border-slate-100 flex justify-between items-start relative">
              <div>
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{comp.competitorName}</h3>
                <a 
                    href={comp.productUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 mt-1 transition-colors"
                >
                  Visit Product Page <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {comp.price ? (
                <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                  {comp.price.includes('₹') ? '' : <IndianRupee className="w-3 h-3 mr-0.5" />}
                  {comp.price}
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-lg">
                  Price N/A
                </span>
              )}
            </div>
            
            <div className="p-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Why it stands out
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 italic text-justify">
                "{comp.eyeCatchingDetails}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorAnalysisComp;