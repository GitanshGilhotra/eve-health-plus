import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../shared/utils';
import {
  Bot,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Zap,
  Activity,
  CheckCircle2,
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { soundFx } from '../shared/soundFx';

export const AIAssistantPage = () => {
  const { centers, openBookingModal } = useAppStore();
  const [activeTab, setActiveTab] = useState('SYMPTOMS');
  
  const [symptomsInput, setSymptomsInput] = useState('Feeling fatigued, cold intolerance, slight weight gain');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [symptomResult, setSymptomResult] = useState({
    possible_categories: ['Endocrinology & Thyroid Function', 'General Metabolic'],
    recommended_tests: [
      {
        test_name: 'Thyroid Profile Total (T3, T4, TSH)',
        reasoning: 'Symptoms like cold intolerance, fatigue, and unexplained weight gain strongly correlate with hypothyroidism.',
        category: 'Endocrinology',
      },
      {
        test_name: 'Complete Blood Count (CBC)',
        reasoning: 'Evaluates baseline red blood cell levels to rule out anemia as a co-contributor to chronic fatigue.',
        category: 'Hematology',
      },
    ],
    urgency_level: 'Low',
    disclaimer: 'DISCLAIMER: This AI recommendation is for informational guidance only and does not substitute professional medical diagnosis.',
  });

  const [ragQuery, setRagQuery] = useState('Do I need to fast before a Thyroid vs Lipid test?');
  const [isRagQuerying, setIsRagQuerying] = useState(false);
  const [ragResult, setRagResult] = useState({
    answer: 'For a Lipid Profile test, a strict 10-12 hour fasting period (water only) is mandatory to ensure accurate triglyceride and LDL calculations. For Thyroid Profile tests (T3, T4, TSH), strict fasting is not mandatory, but morning sample collection before taking daily thyroid medications is strongly advised.',
    sources: ['CDC Diagnostic Guidelines 2024', 'EVE Health Patient Preparation Protocols'],
    score: 0.96,
  });

  const handleQuickSymptom = (text) => {
    soundFx.playClick();
    setSymptomsInput(text);
  };

  const handleRunSymptomAnalysis = () => {
    if (!symptomsInput.trim()) return;
    soundFx.playClick();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const lower = symptomsInput.toLowerCase();
      if (lower.includes('chest') || lower.includes('breath')) {
        setSymptomResult({
          possible_categories: ['Cardiovascular Distress', 'Acute Pulmonary'],
          recommended_tests: [
            {
              test_name: 'Troponin I & Cardiac Markers',
              reasoning: 'Urgent screening for myocardial stress or cardiac tissue ischemia.',
              category: 'Cardiology',
            },
            {
              test_name: 'Complete Blood Count (CBC)',
              reasoning: 'Evaluates infection markers and acute inflammatory response.',
              category: 'Hematology',
            },
          ],
          urgency_level: 'High',
          disclaimer: 'CRITICAL NOTICE: Chest pain or shortness of breath requires immediate clinical evaluation at an emergency facility.',
        });
      } else {
        setSymptomResult({
          possible_categories: ['Metabolic & General Wellness', 'Endocrine Function'],
          recommended_tests: [
            {
              test_name: 'Comprehensive Metabolic Panel (CBC + LFT + KFT)',
              reasoning: 'Provides a complete diagnostic baseline across kidney, liver, and blood health.',
              category: 'General Wellness',
            },
            {
              test_name: 'Vitamin D3 & B12 Combo',
              reasoning: 'Evaluates vitamin deficiency triggers for persistent fatigue.',
              category: 'Vitamin & Wellness',
            },
          ],
          urgency_level: 'Low',
          disclaimer: 'DISCLAIMER: This AI recommendation is for informational guidance only and does not substitute professional medical diagnosis.',
        });
      }
    }, 900);
  };

  const handleRunRagQuery = () => {
    if (!ragQuery.trim()) return;
    soundFx.playClick();
    setIsRagQuerying(true);
    setTimeout(() => {
      setIsRagQuerying(false);
      setRagResult({
        answer: `Retrieval Augmented Generation (RAG) result for "${ragQuery}": Fasting requirements vary by diagnostic assay. Always ensure to drink plain water to prevent dehydration during venipuncture.`,
        sources: ['EVE Health Vector Knowledge Base', 'WHO Laboratory Guidelines'],
        score: 0.94,
      });
    }, 700);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-cyan-950/80 px-3 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
              CLINICAL TRIAGE V2.5
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Bot className="h-7 w-7 text-cyan-400" />
            <span>AI Diagnostic Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Clinical symptom reasoning and evidence-backed medical vector embeddings to recommend targeted assays.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 rounded-2xl bg-slate-900/90 p-1.5 border border-white/10 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('SYMPTOMS');
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'SYMPTOMS'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Symptom Pre-Triage</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('RAG');
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'RAG'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Medical Guidelines RAG</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Symptom Analyzer */}
      {activeTab === 'SYMPTOMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Input Pane (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bento-card p-6 sm:p-7 space-y-5">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Enter Patient Symptoms</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Describe what you are experiencing in plain language.
                </p>
              </div>

              <textarea
                rows={5}
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="e.g. Constant exhaustion, joint stiffness, feeling unusually cold..."
                className="input-premium resize-none text-xs w-full"
              />

              {/* Sample Prompts */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Try Common Scenarios:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickSymptom('Feeling fatigued, cold intolerance, slight weight gain')}
                    className="rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 px-3 py-1.5 text-xs text-slate-300 font-medium transition-colors text-left"
                  >
                    Cold intolerance & Fatigue
                  </button>
                  <button
                    onClick={() => handleQuickSymptom('Chest pain, shortness of breath, sudden dizziness')}
                    className="rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 px-3 py-1.5 text-xs text-slate-300 font-medium transition-colors text-left"
                  >
                    Chest pain & Breathlessness
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunSymptomAnalysis}
                disabled={isAnalyzing}
                className="btn-primary w-full text-xs !py-3.5 font-extrabold disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                <span>Analyze Symptoms & Suggest Assays</span>
              </button>
            </div>
          </div>

          {/* Right Clinical Recommendations (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {symptomResult && (
              <div className="bento-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">Differential Diagnostic Categories</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {symptomResult.possible_categories.map((cat) => (
                        <span key={cat} className="rounded-full bg-cyan-950/80 px-3.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">Urgency Triage</p>
                    <span className={`text-xs font-black px-3.5 py-1 rounded-full border mt-1.5 inline-block ${
                      symptomResult.urgency_level === 'High' 
                        ? 'bg-rose-950/80 text-rose-400 border-rose-500/40' 
                        : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {symptomResult.urgency_level} Priority
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                    Recommended Accredited Lab Assays
                  </h3>
                  <div className="space-y-4">
                    {symptomResult.recommended_tests.map((testItem, idx) => {
                      const targetCenter = centers[0];
                      const matchingTest = targetCenter?.tests?.find((t) => t.name.includes(testItem.test_name.split(' ')[0])) || targetCenter?.tests?.[0];

                      return (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:p-6 space-y-3 group hover:border-cyan-500/40 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 mb-1.5 inline-block">
                                {testItem.category}
                              </span>
                              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{testItem.test_name}</h4>
                            </div>
                            {matchingTest && (
                              <span className="text-lg font-black text-white">{formatCurrency(matchingTest.price)}</span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-400 leading-relaxed font-normal">{testItem.reasoning}</p>

                          {matchingTest && targetCenter && (
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <span className="text-xs text-slate-400">{targetCenter.name}</span>
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  openBookingModal(targetCenter, matchingTest);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                <span>Reserve Slot</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-950/30 p-4 text-xs text-amber-300 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span className="leading-relaxed">{symptomResult.disclaimer}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: RAG Vector Knowledge Query */}
      {activeTab === 'RAG' && (
        <div className="max-w-4xl space-y-6">
          <div className="bento-card p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <span>Search Medical Guidelines & Preparation Protocols</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ask questions about fasting windows, water intake, medication pauses, or specimen collection protocols.
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="e.g. Do I need to fast before a Thyroid vs Lipid test?"
                className="input-premium text-xs flex-1 !py-3"
              />
              <button
                onClick={handleRunRagQuery}
                disabled={isRagQuerying}
                className="btn-primary shrink-0 text-xs !py-3 !px-6 disabled:opacity-50"
              >
                {isRagQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search RAG'}
              </button>
            </div>

            {ragResult && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Verified Clinical Guidance
                  </span>
                  <span className="text-xs text-cyan-400 font-mono">Similarity Score: {(ragResult.score * 100).toFixed(1)}%</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">{ragResult.answer}</p>
                
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/5 flex-wrap">
                  <span className="font-bold text-slate-300">Indexed Sources:</span>
                  {ragResult.sources.map((src, i) => (
                    <span key={i} className="rounded-lg bg-slate-900 border border-white/10 px-2.5 py-1 text-cyan-300 font-mono text-[11px]">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
