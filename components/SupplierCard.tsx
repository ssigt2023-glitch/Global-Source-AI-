
import React from 'react';
import { Supplier } from '../types';

interface SupplierCardProps {
  supplier: Supplier;
  onGenerateRFQ: (supplier: Supplier) => void;
  onAnalyzeCredit: (supplier: Supplier) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onGenerateRFQ, onAnalyzeCredit }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full group">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                supplier.type === 'Supplier' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {supplier.type}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{supplier.country}</span>
            </div>
            <button 
              onClick={() => onAnalyzeCredit(supplier)}
              className="text-left group/name"
            >
              <h3 className="text-lg font-bold text-slate-900 group-hover/name:text-indigo-600 transition-colors leading-tight flex items-center gap-2">
                {supplier.name}
                <i className="fas fa-magnifying-glass-chart text-slate-300 group-hover/name:text-indigo-400 text-xs opacity-0 group-hover/name:opacity-100 transition-all"></i>
              </h3>
            </button>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-xs font-bold whitespace-nowrap ${getScoreColor(supplier.reliabilityScore)}`}>
            {supplier.reliabilityScore}% Reliability
          </div>
        </div>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex gap-2">
            <i className="fas fa-globe text-slate-300 mt-0.5"></i>
            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
              {supplier.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
          <div className="flex gap-2">
            <i className="fas fa-box-open text-slate-300 mt-0.5"></i>
            <span className="text-slate-600 italic">"{supplier.materialMatch}"</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {supplier.certifications.slice(0, 3).map((cert, i) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                {cert}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700 uppercase text-[9px] mr-1">Analysis:</strong>
            {supplier.whyScore}
          </p>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-50 flex gap-2">
        <button
          onClick={() => onAnalyzeCredit(supplier)}
          className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-shield-halved text-indigo-500"></i>
          Verify Credit
        </button>
        <button
          onClick={() => onGenerateRFQ(supplier)}
          className="flex-[1.5] bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <i className="fas fa-file-invoice"></i>
          Draft RFQ
        </button>
      </div>
    </div>
  );
};

export default SupplierCard;
