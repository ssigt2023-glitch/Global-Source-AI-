
import React from 'react';
import { ReliabilityReport } from '../types';

interface ReliabilityReportModalProps {
  report: ReliabilityReport | null;
  loading: boolean;
  onClose: () => void;
}

const ReliabilityReportModal: React.FC<ReliabilityReportModalProps> = ({ report, loading, onClose }) => {
  if (!loading && !report) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Caution': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Not Recommended': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getVerdictIcon = (status: string) => {
    switch (status) {
      case 'Safe': return 'fa-circle-check';
      case 'Caution': return 'fa-circle-exclamation';
      case 'Not Recommended': return 'fa-circle-xmark';
      default: return 'fa-circle-question';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
              <i className="fas fa-shield-check"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Corporate Reliability Analysis</h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Confidential Inspection Report</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
            <h3 className="text-xl font-bold mb-2">Deep-Web Forensic Scanning...</h3>
            <p className="text-slate-500 max-w-md">Querying trade registers, shipment logs, and legal databases for real-time verification.</p>
          </div>
        ) : report && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Main Score & Verdict */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Reliability Index</div>
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                      <circle 
                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * (report.score?.value || 0)) / 100}
                        className="text-indigo-600 transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="absolute text-3xl font-black text-slate-900">{report.score?.value || 0}%</span>
                  </div>
                  <div className="text-sm font-black text-indigo-600 uppercase tracking-widest">{report.score?.category || 'N/A'}</div>
                </div>

                <div className={`p-6 rounded-3xl border-2 shadow-sm ${getStatusColor(report.verdict?.status || 'Unknown')}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <i className={`fas ${getVerdictIcon(report.verdict?.status || 'Unknown')} text-2xl`}></i>
                    <h4 className="font-black uppercase tracking-widest text-xs">RFQ Verdict</h4>
                  </div>
                  <div className="text-xl font-black mb-2">{report.verdict?.status === 'Safe' ? 'Recommended' : (report.verdict?.status || 'Unknown')}</div>
                  {report.verdict?.conditions && <p className="text-sm font-medium opacity-80">{report.verdict.conditions}</p>}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Flags</h4>
                  {report.riskFlags && report.riskFlags.length > 0 ? (
                    <div className="space-y-2">
                      {report.riskFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                          <i className="fas fa-triangle-exclamation mt-0.5"></i>
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                      <i className="fas fa-check-circle"></i> No Critical Red Flags Found
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Data Points */}
              <div className="lg:col-span-8 space-y-8">
                {/* Section 1: Snapshot */}
                <div className="grid grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="col-span-2 flex items-center gap-3 mb-2">
                    <i className="fas fa-id-card text-indigo-400"></i>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Company Snapshot</h4>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1">Legal Entity</div>
                    <div className="text-sm font-bold">{report.snapshot?.legalName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1">Ownership</div>
                    <div className="text-sm font-bold">{report.snapshot?.ownership || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1">Reg. Year</div>
                    <div className="text-sm font-bold">{report.snapshot?.incorporationYear || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1">Location</div>
                    <div className="text-sm font-bold">{report.snapshot?.location || 'N/A'}</div>
                  </div>
                </div>

                {/* Section 2: History & Compliance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-line"></i> Trade History
                      </h4>
                      <div className="space-y-3">
                        <div className="text-xs"><span className="text-slate-400 mr-2">Experience:</span><span className="font-bold">{report.tradeHistory?.experienceYears || 'N/A'}</span></div>
                        <div className="text-xs"><span className="text-slate-400 mr-2">Consistency:</span><span className="font-bold">{report.tradeHistory?.consistency || 'N/A'}</span></div>
                        <div className="text-xs"><span className="text-slate-400 mr-2">Inspection Agencies:</span><span className="font-bold">{report.tradeHistory?.inspections || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fas fa-clipboard-check"></i> Compliance
                      </h4>
                      <div className="space-y-3">
                        <div className="text-xs"><span className="text-slate-400 mr-2">Registration:</span><span className="font-bold">{report.compliance?.registrationStatus || 'N/A'}</span></div>
                        <div className="text-xs"><span className="text-slate-400 mr-2">Legal/Litigation:</span><span className="font-bold">{report.compliance?.legalIssues || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Mitigation */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Risk Mitigation Strategy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Payment Strategy</div>
                        <p className="text-xs leading-relaxed">{report.mitigation?.paymentTerms || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Required Verification</div>
                        <p className="text-xs leading-relaxed">{report.mitigation?.verificationActions || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <i className="fas fa-vault absolute -right-6 -bottom-6 text-9xl text-white/5 pointer-events-none"></i>
                </div>
              </div>
            </div>

            {/* Final Verdict Banner */}
            <div className="mt-12 p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] text-center">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Executive Summary Verdict</h4>
              <p className="text-lg font-black text-slate-900 leading-tight">"{report.executiveSummary || 'No summary available.'}"</p>
            </div>
          </div>
        )}

        <div className="p-8 border-t border-slate-100 shrink-0 bg-white">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
          >
            Acknowledge Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReliabilityReportModal;
