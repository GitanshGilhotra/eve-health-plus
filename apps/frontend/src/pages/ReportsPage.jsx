import React, { useState } from 'react';
import { FileText, Download, Eye, ShieldCheck, Calendar, Building2, CheckCircle2, X } from 'lucide-react';
import { soundFx } from '../shared/soundFx';

const mockReports = [
  {
    id: 'REP-9921',
    testName: 'Liver Function Test (LFT) Comprehensive',
    centerName: 'Metropolis Precision Labs',
    date: 'Sep 25, 2026',
    doctor: 'Dr. Marcus Vance, MD',
    fileUrl: 'https://evehealth-reports.s3.amazonaws.com/lft_report.pdf',
    status: 'VERIFIED',
    biomarkers: [
      { name: 'Alanine Aminotransferase (ALT)', value: '28 U/L', status: 'Normal', range: '7 - 56 U/L' },
      { name: 'Aspartate Aminotransferase (AST)', value: '24 U/L', status: 'Normal', range: '10 - 40 U/L' },
      { name: 'Serum Bilirubin (Total)', value: '0.8 mg/dL', status: 'Normal', range: '0.1 - 1.2 mg/dL' },
      { name: 'Alkaline Phosphatase (ALP)', value: '72 U/L', status: 'Normal', range: '44 - 147 U/L' },
    ],
  },
  {
    id: 'REP-8812',
    testName: 'Complete Blood Count (CBC) with Differential',
    centerName: 'Apollo Health Diagnostic Hub',
    date: 'Aug 14, 2026',
    doctor: 'Dr. Sarah Lin, MD',
    fileUrl: 'https://evehealth-reports.s3.amazonaws.com/cbc_report.pdf',
    status: 'VERIFIED',
    biomarkers: [
      { name: 'Hemoglobin (Hb)', value: '14.2 g/dL', status: 'Normal', range: '12.0 - 15.5 g/dL' },
      { name: 'White Blood Cell (WBC)', value: '6,800 /µL', status: 'Normal', range: '4,500 - 11,000 /µL' },
      { name: 'Platelet Count', value: '260,000 /µL', status: 'Normal', range: '150,000 - 450,000 /µL' },
    ],
  },
];

export const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-cyan-950/80 px-3 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
              AES-256 ENCRYPTED VAULT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <FileText className="h-7 w-7 text-cyan-400" />
            <span>Digital Lab Reports & Records</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Verified PDF documents with automated biomarker OCR extraction and NABL digital signature hashes.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-white/10 rounded-2xl px-5 py-3 shrink-0">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Available Records</p>
          <p className="text-xl font-black text-emerald-400">2 Verified PDFs</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {mockReports.map((report) => (
          <div
            key={report.id}
            className="bento-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-cyan-500/30 transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-full bg-emerald-950/80 px-3 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {report.status} BY LAB
                </span>
                <span className="text-xs font-mono text-slate-400">Ref: #{report.id}</span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                {report.testName}
              </h3>

              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                  {report.centerName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  {report.date}
                </span>
                <span className="text-slate-300">Signed by: {report.doctor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSelectedReport(report);
                }}
                className="btn-secondary text-xs !py-2.5 !px-4"
              >
                <Eye className="h-4 w-4 text-slate-400" />
                <span>View Biomarkers</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  alert(`Downloading verified PDF report ${report.id} (${report.testName})...`);
                }}
                className="btn-primary text-xs !py-2.5 !px-4"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-white/15 p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Biomarker Assay Inspection
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">{selectedReport.testName}</h3>
                <p className="text-xs text-slate-400">{selectedReport.centerName} • {selectedReport.date}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-900 hover:text-white border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b border-white/10 pb-2.5 text-slate-400 font-bold uppercase text-[10px]">
                <span>Biomarker Analyte</span>
                <span>Observed Result</span>
                <span>Standard Range</span>
              </div>
              {selectedReport.biomarkers?.map((bm, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5 items-center">
                  <span className="text-slate-200 font-sans font-medium text-xs">{bm.name}</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    {bm.value}
                  </span>
                  <span className="text-slate-400">{bm.range}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Digitally verified by {selectedReport.doctor}
              </span>
              <button
                onClick={() => setSelectedReport(null)}
                className="btn-secondary text-xs !py-2 !px-4"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
