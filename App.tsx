
import React, { useState, useRef, useEffect } from 'react';
import { findSuppliers, analyzeCompanyReliability } from './services/geminiService';
import { Supplier, SearchResult, SourcingParams, ReliabilityReport } from './types';
import SupplierCard from './components/SupplierCard';
import RFQModal from './components/RFQModal';
import ReliabilityReportModal from './components/ReliabilityReportModal';

const App: React.FC = () => {
  const [params, setParams] = useState<SourcingParams>({
    material: '',
    keywords: '',
    countryFilter: '',
    additionalRequirements: '',
  });
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');

  // Reliability Analysis State
  const [activeAnalysis, setActiveAnalysis] = useState<ReliabilityReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    "Searching global supplier databases...",
    "Analyzing trader registries...",
    "Verifying safety and quality certifications...",
    "Calculating reliability scores...",
    "Finalizing market intelligence reports..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let stepIdx = 0;
      setLoadingStep(loadingSteps[0]);
      interval = setInterval(() => {
        stepIdx = (stepIdx + 1) % loadingSteps.length;
        setLoadingStep(loadingSteps[stepIdx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setParams(prev => ({ ...prev, imageData: base64String, imageMimeType: file.type }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.material && !params.imageData) {
      setError("Please provide a product name or an image to search.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await findSuppliers(params);
      setResult(data);
    } catch (err) {
      setError("Failed to fetch market results. Please refine your search.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCredit = async (supplier: Supplier) => {
    setAnalyzing(true);
    setActiveAnalysis(null);
    try {
      const report = await analyzeCompanyReliability(supplier);
      setActiveAnalysis(report);
    } catch (err) {
      console.error("Analysis failed", err);
      // Fallback or error state could be handled here
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <i className="fas fa-industry text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">GlobalSource AI</h1>
          </div>
          <div className="hidden md:flex items-center text-sm text-slate-500 font-medium">
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] mr-2">LIVE SEARCH ENABLED</span>
            Enterprise Grade Sourcing
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero & Search Form */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Discover Reliable Global Suppliers & Traders
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Advanced sourcing platform to find materials, evaluate market reliability, and perform deep credit analysis in seconds.
          </p>

          <form onSubmit={onSearch} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Product / Material Name *</label>
                <div className="relative">
                  <i className="fas fa-box absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    placeholder="e.g. Polypropylene Resin, Graphene Nanoplatelets"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium"
                    value={params.material}
                    onChange={e => setParams(p => ({ ...p, material: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Specifications / Keywords</label>
                <input
                  type="text"
                  placeholder="e.g. 99% purity, Food Grade"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm transition-all"
                  value={params.keywords}
                  onChange={e => setParams(p => ({ ...p, keywords: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Country Filter</label>
                <input
                  type="text"
                  placeholder="e.g. Germany, China, Japan"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm transition-all"
                  value={params.countryFilter}
                  onChange={e => setParams(p => ({ ...p, countryFilter: e.target.value }))}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Visual Reference (Image Search)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-14 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                    imagePreview ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {imagePreview ? (
                    <div className="flex items-center gap-3 px-3 w-full">
                      <img src={imagePreview} className="w-8 h-8 rounded object-cover shadow-sm" />
                      <span className="text-xs font-bold text-indigo-700 truncate">Image Ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-camera text-slate-300"></i>
                      <span className="text-xs font-bold text-slate-400">Click to Upload Image</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Sender Name / Company</label>
                <input
                  type="text"
                  placeholder="e.g. Alex @ TechFlow"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm transition-all"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setUserName(e.target.value.split(' ')[0]);
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Searching Global Market...
                </>
              ) : (
                <>
                  <i className="fas fa-magnifying-glass"></i>
                  Analyze Global Market
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-full animate-ping absolute opacity-75"></div>
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white relative">
                  <i className="fas fa-satellite-dish text-2xl animate-pulse"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cross-Referencing Global Databases</h3>
              <p className="text-slate-500 font-medium">{loadingStep}</p>
            </div>
          ) : result ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center gap-6">
                <div className="bg-indigo-500 p-4 rounded-2xl">
                  <i className="fas fa-chart-line text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Market Intelligence Summary</h3>
                  <p className="text-indigo-50 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Recommended Leads</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    {result.suppliers.length} Verified Results
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {result.suppliers.map(supplier => (
                    <SupplierCard 
                      key={supplier.id} 
                      supplier={supplier} 
                      onGenerateRFQ={setSelectedSupplier} 
                      onAnalyzeCredit={handleAnalyzeCredit}
                    />
                  ))}
                </div>
              </div>

              {result.sources.length > 0 && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Verification Sources (Search Grounding)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {result.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-start gap-3 group"
                      >
                        <div className="bg-white p-2 rounded-lg border border-slate-200 group-hover:border-indigo-100 shadow-sm">
                          <i className="fas fa-link text-slate-300 text-xs"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">{source.title}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{new URL(source.uri).hostname}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-100 p-8 rounded-3xl text-center">
              <i className="fas fa-exclamation-triangle text-rose-500 text-3xl mb-4"></i>
              <h3 className="text-lg font-bold text-rose-900 mb-2">Search Interrupted</h3>
              <p className="text-rose-700/70 text-sm mb-6">{error}</p>
              <button onClick={() => setError(null)} className="px-8 py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all">
                Dismiss Error
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 grayscale pointer-events-none">
              <i className="fas fa-box-open text-6xl text-slate-300 mb-6"></i>
              <h3 className="text-2xl font-bold text-slate-400">Awaiting Search Parameters</h3>
              <p className="text-slate-400 text-sm mt-2">Fill in the sourcing form above to start your market analysis.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 text-white">
            <i className="fas fa-industry text-2xl"></i>
            <span className="text-xl font-bold">GlobalSource AI</span>
          </div>
          <p className="text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Enterprise procurement intelligence engine. Discover, verify, and connection with global trade partners using deep credit analysis.
          </p>
        </div>
      </footer>

      {/* RFQ Modal */}
      {selectedSupplier && (
        <RFQModal
          supplier={selectedSupplier}
          userName={userName}
          companyName={companyName}
          onClose={() => setSelectedSupplier(null)}
        />
      )}

      {/* Reliability/Credit Modal */}
      {(analyzing || activeAnalysis) && (
        <ReliabilityReportModal
          loading={analyzing}
          report={activeAnalysis}
          onClose={() => {
            setActiveAnalysis(null);
            setAnalyzing(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
