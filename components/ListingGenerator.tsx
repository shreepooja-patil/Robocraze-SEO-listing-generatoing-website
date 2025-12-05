import React, { useState, useRef, useEffect } from 'react';
import { generateProductListing } from '../services/geminiService';
import { ProductListing } from '../types';
import { Loader2, Wand2, ShoppingCart, Globe, Tag, CheckCircle2, Download, FileText } from 'lucide-react';

const ListingGenerator: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductListing | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const presets = [
    { name: "Ai-WB2-32S-Kit", url: "https://www.amazon.in/REES52-Ai-WB2-32S-Ai-Thinker-NODEMCU-AI-WB2-32S-kit/dp/B0D233BJFB" },
    { name: "XR2206 Signal Generator", url: "https://www.alibaba.com/product-detail/High-Precision-Xr2206-Signal-Generator-DIY_1601473560924.html" }
  ];

  const handleGenerate = async () => {
    if (!productName) return;
    setLoading(true);
    // Note: We don't clear result here to prevent UI jump, we replace it when new data arrives
    try {
      const data = await generateProductListing(productName, referenceUrl);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate listing. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && !loading) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result, loading]);

  const loadPreset = (p: { name: string, url: string }) => {
    setProductName(p.name);
    setReferenceUrl(p.url);
    // Don't clear result immediately for smoother transition
  };

  const handleDownloadCSV = () => {
    if (!result) return;

    const headers = [
      "Field",
      "Content"
    ];

    // Prepare rows for a vertical key-value format which is often easier to read for single products
    // Alternatively, we can do a horizontal format. Let's do horizontal for database readiness.
    
    const columns = [
      "Product Name Input",
      "Website Title",
      "Amazon Title",
      "Bullet Points",
      "SEO Description",
      "Technical Specs",
      "Search Keywords",
      "Meta Title",
      "Meta Description",
      "Suggested Tags"
    ];

    const escapeCsv = (str: string) => {
      if (str == null) return '""';
      // Escape double quotes and wrap in double quotes
      return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const row = [
      productName,
      result.productTitleWebsite,
      result.productTitleAmazon,
      result.bulletPoints.join('\n'),
      result.seoDescription,
      result.technicalSpecifications.map(s => `${s.name}: ${s.value}`).join('; '),
      result.searchKeywords.join(', '),
      result.metaTitle,
      result.metaDescription,
      result.suggestedTags.join(', ')
    ];

    const csvContent = [
      columns.join(','),
      row.map(escapeCsv).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_listing.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Input Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group animate-fade-in">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl group-hover:bg-blue-100 transition-colors duration-700"></div>
        
        <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Wand2 className="w-5 h-5" />
              </span>
              1. Generate Website Listing
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                   <label className="text-sm font-semibold text-slate-700">Product Name</label>
                   <div className="flex gap-2">
                      {presets.map(p => (
                        <button 
                          key={p.name}
                          onClick={() => loadPreset(p)}
                          className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all hover:scale-105 active:scale-95"
                        >
                          {p.name}
                        </button>
                      ))}
                   </div>
                </div>
                <input 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none placeholder:text-slate-400 transition-all shadow-sm hover:border-blue-200"
                  placeholder="e.g., Ai-WB2-32S NodeMCU Kit"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Reference URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full p-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none placeholder:text-slate-400 transition-all shadow-sm hover:border-blue-200"
                  placeholder="https://amazon.in/..."
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !productName}
                className={`
                  w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-3 relative overflow-hidden
                  ${loading ? 'cursor-not-allowed opacity-90 bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
                `}
              >
                {loading && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                {loading ? (
                   <><Loader2 className="animate-spin w-5 h-5" /> Generating Content...</>
                ) : (
                   <><Wand2 className="w-5 h-5" /> Generate SEO Listing</>
                )}
              </button>
            </div>
        </div>
      </div>

      {/* Loading Skeleton or Results */}
      {loading && !result && (
        <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-slate-200/70 rounded-2xl w-full"></div>
            <div className="h-64 bg-slate-200/70 rounded-2xl w-full"></div>
        </div>
      )}

      {result && (
        <div className="space-y-6" ref={resultRef}>
          {/* Action Bar */}
          <div className="flex justify-end items-center animate-fade-in">
             <button 
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-green-700 hover:shadow-lg transition-all active:scale-95"
             >
                <FileText className="w-4 h-4" /> 
                Download CSV
             </button>
          </div>

          {/* Titles Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pop-in stagger-1 hover:shadow-md transition-shadow">
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-700">Optimized Titles</h3>
            </div>
            <div className="p-6 grid gap-6 md:grid-cols-2">
              <div className="group">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block flex items-center gap-1">
                   Website Format
                </span>
                <div className="p-4 bg-white rounded-xl text-slate-800 border-2 border-slate-100 group-hover:border-blue-100 group-hover:shadow-sm transition-all">
                    {result.productTitleWebsite}
                </div>
              </div>
              <div className="group">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                   Amazon Format
                </span>
                <div className="p-4 bg-white rounded-xl text-slate-800 border-2 border-slate-100 group-hover:border-slate-300 group-hover:shadow-sm transition-all">
                    {result.productTitleAmazon}
                </div>
              </div>
            </div>
          </div>

          {/* Features & Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pop-in stagger-2 hover:shadow-md transition-shadow">
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-700">Marketing Content</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Key Features (Bullet Points)</span>
                <ul className="space-y-3">
                  {result.bulletPoints.map((bp, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-sm group">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="leading-relaxed">{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100/50">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">SEO Description</span>
                <p className="text-sm text-slate-700 leading-7">{result.seoDescription}</p>
              </div>
            </div>
          </div>

           {/* Specs */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pop-in stagger-3 hover:shadow-md transition-shadow">
             <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-700">Technical Specifications</h3>
             </div>
             <div className="p-0">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Specification</th>
                    <th className="px-6 py-4 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.technicalSpecifications.map((spec, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-900">{spec.name}</td>
                      <td className="px-6 py-3 text-slate-600 font-mono text-xs">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pop-in stagger-4 hover:shadow-md transition-shadow">
             <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-700">SEO Metadata Strategy</h3>
             </div>
             <div className="p-6 space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Meta Title</span>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-blue-600 font-medium truncate hover:text-blue-700 cursor-pointer">
                        {result.metaTitle}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Meta Description</span>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 line-clamp-2">
                        {result.metaDescription}
                    </div>
                 </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Target Keywords</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Top 15</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.searchKeywords.map(k => (
                    <span key={k} className="px-3 py-1.5 bg-white text-slate-600 text-xs font-medium rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors cursor-default">
                        {k}
                    </span>
                  ))}
                </div>
              </div>

               <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">Suggested Collections / Tags</span>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedTags.map(k => (
                    <span key={k} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                        #{k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingGenerator;