
import React, { useState } from 'react';
import { Supplier } from '../types';

interface RFQModalProps {
  supplier: Supplier;
  userName: string;
  companyName: string;
  onClose: () => void;
}

const RFQModal: React.FC<RFQModalProps> = ({ supplier, userName, companyName, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Fix: Changed supplier.material to supplier.materialMatch (Line 15)
  const emailSubject = `Request for Quotation – ${supplier.materialMatch}`;
  // Fix: Changed supplier.material to supplier.materialMatch (Line 18)
  const emailBody = `Dear ${supplier.name} Sales Team,

I hope you are doing well. We are exploring procurement options for ${supplier.materialMatch} and would like to request a formal quotation. 

Our company, ${companyName || '[Company Name]'}, is interested in high-quality sourcing from reliable partners like ${supplier.name}.

Please provide the following details:
• Product specifications and data sheets
• Pricing (FOB/CIF)
• Minimum order quantity (MOQ)
• Payment terms
• Lead time from order confirmation
• Relevant certifications (${supplier.certifications.join(', ') || 'ISO, CE, etc.'})
• Packaging details and shipping dimensions

Looking forward to your professional response.

Best regards,

${userName || '[Your Name]'}
${companyName || '[Your Company]'}`;

  const copyToClipboard = () => {
    const textToCopy = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Request for Quotation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
            <div className="p-3 bg-slate-100 rounded-lg text-slate-700 font-medium">
              {emailSubject}
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Message Body</label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-line text-sm font-normal leading-relaxed">
              {emailBody}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={copyToClipboard}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <i className={copied ? 'fas fa-check' : 'fas fa-copy'}></i>
            {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
          </button>
          <a
            href={`mailto:${supplier.contact || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            <i className="fas fa-envelope"></i>
            Open in Email App
          </a>
        </div>
      </div>
    </div>
  );
};

export default RFQModal;
