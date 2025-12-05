import React, { useState } from 'react';
import { assignCategories } from '../services/geminiService';
import { CategoryMapping } from '../types';
import { Loader2, Layers, ArrowRight, CornerDownRight, Box, Copy, Check } from 'lucide-react';

const CategoryManager: React.FC = () => {
  const defaultItems = [
    "Li-Ion 18650 Cell",
    "FlySky FS-16X 2.4GHz",
    "DIY Paper Foldscope",
    "MT02DX Stripper"
  ];
  
  const [items, setItems] = useState<string>(defaultItems.join('\n'));
  const [results, setResults] = useState<CategoryMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCategorize = async () => {
    setLoading(true);
    setResults([]);
    try {
        const itemList = items.split('\n').filter(i => i.trim() !== '');
        const data = await assignCategories(itemList);
        setResults(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const copyResults = () => {
    const text = results.map(r => `${r.productName} -> ${r.assignedCategory}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="grid md:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="md:col-span-5 h-fit sticky top-24">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                    <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                        <Layers className="w-5 h-5" />
                    </span>
                    3. Bulk Categorizer
                </h2>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Paste your product list below (one item per line). The AI will map them to the correct Robocraze taxonomy.
                </p>
                
                <div className="relative">
                    <textarea 
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                        className="w-full h-64 p-4 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 outline-none font-mono text-sm mb-4 placeholder:text-slate-400 resize-none shadow-inner"
                        placeholder="Product 1&#10;Product 2&#10;Product 3"
                    />
                    <div className="absolute top-2 right-2 text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                        {items.split('\n').filter(x => x.trim()).length} Items
                    </div>
                </div>
                
                <button 
                    onClick={handleCategorize}
                    disabled={loading || !items.trim()}
                    className={`
                        w-full py-3 rounded-xl text-white font-semibold shadow-md transition-all duration-300 flex justify-center items-center gap-2
                        ${loading || !items.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}
                    `}
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Assign Categories'}
                </button>
            </div>
        </div>

        {/* Output Section */}
        <div className="md:col-span-7 space-y-4">
            {results.length > 0 && (
                <div className="flex justify-end mb-2">
                    <button 
                        onClick={copyResults}
                        className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-transparent hover:border-blue-100"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied to Clipboard' : 'Copy All Results'}
                    </button>
                </div>
            )}

            {results.length === 0 && !loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
                    <Box className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium text-slate-400">Ready to organize</p>
                    <p className="text-sm">Results will appear here</p>
                </div>
            )}
            
            {loading && (
                 <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 animate-pulse">
                            <div className="h-5 w-1/3 bg-slate-100 rounded mb-3"></div>
                            <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
                        </div>
                    ))}
                 </div>
            )}

            {results.map((item, idx) => (
                <div 
                    key={idx} 
                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 animate-slide-in hover:shadow-md transition-all duration-300 group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                {idx + 1}
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg">{item.productName}</h3>
                        </div>
                    </div>
                    
                    <div className="ml-11">
                        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-3 bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
                            <CornerDownRight className="w-4 h-4" />
                            {item.assignedCategory}
                        </div>
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100/50 leading-relaxed">
                            "{item.reasoning}"
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;