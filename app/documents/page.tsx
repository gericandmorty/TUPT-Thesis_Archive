'use client';

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    FaUpload,
    FaFileAlt,
    FaCloudUploadAlt,
    FaTimes,
    FaChevronDown,
    FaChevronUp,
    FaDownload,
    FaRedo,
    FaLightbulb,
    FaSearch,
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { PYTHON_API_URL } from '@/lib/api';

interface AnalysisResult {
    overallScore?: number;
    totalIssues?: number;
    wordCount?: number;
    sentenceCount?: number;
    paragraphCount?: number;
    categories?: AnalysisCategory[];
    [key: string]: unknown;
}

interface AnalysisCategory {
    name: string;
    color: string;
    issues: AnalysisIssue[];
}

interface AnalysisIssue {
    title: string;
    description: string;
    suggestion: string;
    severity: string;
    occurrences?: number;
}

const DocumentsPage: React.FC = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('userData');
        if (!userData) router.push('/login');
    }, [router]);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) validateAndSetFile(file);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const validateAndSetFile = (file: File) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a PDF, DOCX, or TXT file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }
        setSelectedFile(file);
        toast.success(`File "${file.name}" selected!`);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('thesis', selectedFile);

            const response = await fetch(`${PYTHON_API_URL}/api/analyze-thesis`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                const categoryColors: Record<string, string> = {
                    'Readability': '#8b0000',
                    'Structure': '#f59e0b',
                    'Writing Style': '#8b5cf6',
                    'Academic Style': '#3b82f6',
                    'Grammar & Style': '#ec4899',
                };

                const grouped: Record<string, AnalysisIssue[]> = {};
                (data.recommendations || []).forEach((rec: { category: string; title: string; description: string; suggestion: string; severity: string }) => {
                    if (!grouped[rec.category]) grouped[rec.category] = [];
                    grouped[rec.category].push({
                        title: rec.title,
                        description: rec.description,
                        suggestion: rec.suggestion,
                        severity: rec.severity,
                    });
                });

                const categories: AnalysisCategory[] = Object.entries(grouped).map(([name, issues]) => ({
                    name,
                    color: categoryColors[name] || '#3f2b2b',
                    issues,
                }));

                const totalIssues = (data.recommendations || []).length;

                const mapped: AnalysisResult = {
                    overallScore: data.overallScore,
                    totalIssues,
                    wordCount: data.statistics?.wordCount,
                    sentenceCount: data.statistics?.sentenceCount,
                    paragraphCount: data.statistics?.paragraphCount,
                    categories,
                };

                setAnalysisResult(mapped);
                setShowModal(true);
                toast.success('Analysis complete!');
            } else {
                toast.error(data.error || data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            const mockResult: AnalysisResult = {
                overallScore: 78,
                totalIssues: 12,
                wordCount: 4523,
                sentenceCount: 187,
                paragraphCount: 34,
                categories: [
                    {
                        name: 'Grammar & Spelling',
                        color: '#8b0000',
                        issues: [
                            { title: 'Subject-verb agreement', description: 'Several instances of subject-verb disagreement found.', suggestion: 'Review subjects and ensure matching verb forms.', severity: 'high', occurrences: 3 },
                            { title: 'Spelling errors', description: 'Minor spelling mistakes detected.', suggestion: 'Run a spell check and review highlighted words.', severity: 'medium', occurrences: 2 },
                        ],
                    },
                    {
                        name: 'Structure & Flow',
                        color: '#f59e0b',
                        issues: [
                            { title: 'Paragraph length', description: 'Some paragraphs are too long and may lose reader attention.', suggestion: 'Break long paragraphs into shorter, focused ones.', severity: 'medium', occurrences: 4 },
                        ],
                    },
                ],
            };
            setAnalysisResult(mockResult);
            setShowModal(true);
            toast.info('Showing demo analysis (server unavailable)');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleCategory = (index: number) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const getScoreLabel = (score: number): string => {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Work';
    };

    const severityColors: Record<string, string> = {
        high: 'bg-[#8b0000]',
        medium: 'bg-amber-600',
        low: 'bg-[#3f2b2b]',
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <CustomHeader
                onMenuPress={() => setMenuVisible(true)}
                onSearch={() => { }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            <main className="flex-grow">
                {/* Hero Upload Section - Consistent Gradient */}
                <section className="bg-gradient-to-br from-[#8b0000] via-[#fecaca] to-white pt-12 pb-16 px-6 text-foreground relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-[#8b0000]/5 rounded-full blur-3xl" />
                    <div className="max-w-3xl mx-auto relative z-10">
                        <div className="text-center mb-10">
                            <h2 className="text-sm font-black text-[#8b0000] uppercase tracking-widest mb-3">Thesis Analysis Module</h2>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-gray-900">
                                Document Repository
                            </h1>
                            <p className="text-gray-600 text-lg font-bold">
                                Upload and evaluate your research against institutional standards.
                            </p>
                        </div>

                        {/* Upload Area - Restyled to match institutional dark card aesthetic */}
                        <div
                            className={`border-4 border-dashed rounded-[2rem] p-12 text-center transition-all duration-500 cursor-pointer shadow-xl ${isDragOver
                                ? 'border-[#8b0000] bg-white scale-[1.02]'
                                : 'border-gray-200 bg-white/60 hover:bg-white hover:border-[#8b0000]/40 shadow-gray-200/50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileSelect}
                            />
                            <div className="w-20 h-20 bg-[#8b0000]/5 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110">
                                <FaCloudUploadAlt className="text-4xl text-[#8b0000]" />
                            </div>
                            <p className="text-xl font-black text-gray-900 mb-2">
                                {isDragOver ? 'Release to upload' : 'Institution-wide Submission'}
                            </p>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                                PDF, DOCX, or TXT (Max 10MB)
                            </p>
                        </div>

                        {/* Selected File Info */}
                        {selectedFile && (
                            <div className="mt-8 bg-[#3f2b2b] rounded-2xl p-5 flex items-center justify-between shadow-2xl border-4 border-[#3f2b2b] animate-slide-up">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                        <FaFileAlt className="text-lg text-[#fecaca]" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-black text-white truncate max-w-[200px] md:max-w-[300px]">{selectedFile.name}</p>
                                        <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">{(selectedFile.size / 1024).toFixed(1)} KB &bull; Selected</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="p-2 text-white/30 hover:text-white transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                    >
                                        <FaTimes />
                                    </button>
                                    <button
                                        className={`px-6 py-2.5 rounded-xl bg-[#b91c1c] text-white font-black text-xs uppercase tracking-widest border-2 border-white hover:bg-red-800 transition-all shadow-lg flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                <FaSearch className="text-[10px]" /> Run Analysis
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Empty state content */}
                {!analysisResult && (
                    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                        <div className="w-24 h-24 mx-auto mb-8 rounded-[1.5rem] bg-[#3f2b2b] flex items-center justify-center shadow-2xl shadow-black/40 border-4 border-[#3f2b2b] transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <FaFileAlt className="text-4xl text-[#fecaca]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">Ready for submission</h3>
                        <p className="text-[10px] text-[#8b0000] font-black uppercase tracking-[0.3em] mb-10 max-w-sm mx-auto leading-relaxed">
                            Awaiting document upload for institutional verification
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto">
                            {['PDF', 'DOCX', 'TXT'].map(format => (
                                <div key={format} className="bg-[#3f2b2b] rounded-2xl p-6 shadow-2xl shadow-black/30 border-4 border-[#3f2b2b] hover:border-white/10 transition-all duration-300">
                                    <h4 className="text-lg font-black text-white">.{format}</h4>
                                    <p className="text-[9px] text-[#fecaca]/40 font-black uppercase tracking-widest mt-1">Verified Format</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Analysis Results Modal - Restyled to Match Institutional Theme */}
            {showModal && analysisResult && (
                <div className="fixed inset-0 bg-[#3f2b2b]/80 backdrop-blur-md z-[1000] flex items-center justify-center p-5 animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-[650px] max-h-[90vh] flex flex-col shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] animate-slide-up overflow-hidden border-8 border-[#3f2b2b]">

                        {/* Modal Header */}
                        <div className="flex justify-between items-start p-8 pb-6 bg-gray-50">
                            <div>
                                <h2 className="text-xs font-black text-[#8b0000] uppercase tracking-[0.2em] mb-2">Institutional Report</h2>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedFile?.name}</h3>
                            </div>
                            <button
                                className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-[#8b0000] shadow-sm transition-all"
                                onClick={() => setShowModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Main Score Area */}
                        <div className="flex items-center gap-8 px-8 py-8 border-b border-gray-100">
                            <div className="w-[100px] h-[100px] rounded-[2rem] bg-[#3f2b2b] flex flex-col items-center justify-center text-[#fecaca] shadow-xl transform -rotate-3">
                                <span className="text-3xl font-black leading-none">{analysisResult.overallScore}</span>
                                <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">Score</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-1">
                                    {getScoreLabel(analysisResult.overallScore || 0)}
                                </h3>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wide">
                                    {analysisResult.totalIssues} specific improvements identified
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-4">
                                {analysisResult.categories?.map((category, catIdx) => (
                                    <div key={catIdx} className="bg-gray-50 rounded-2xl overflow-hidden border-2 border-transparent hover:border-gray-100 transition-all">
                                        <button
                                            className="w-full flex justify-between items-center p-5 text-left transition-colors"
                                            onClick={() => toggleCategory(catIdx)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                                <span className="text-sm font-black text-gray-900 uppercase tracking-wider">{category.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-white px-2.5 py-1 rounded-lg bg-[#3f2b2b]">
                                                    {category.issues.length}
                                                </span>
                                                {expandedCategories.has(catIdx) ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                            </div>
                                        </button>

                                        {expandedCategories.has(catIdx) && (
                                            <div className="p-5 pt-0 space-y-4 animate-fade-in">
                                                {category.issues.map((issue, issueIdx) => (
                                                    <div key={issueIdx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-sm font-black text-gray-900">{issue.title}</span>
                                                            <span className={`${severityColors[issue.severity]} text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest`}>
                                                                {issue.severity}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-bold leading-relaxed mb-4">{issue.description}</p>
                                                        <div className="bg-[#fef2f2] p-4 rounded-xl border-l-4 border-[#8b0000]">
                                                            <p className="text-xs text-[#8b0000] font-black italic">
                                                                <FaLightbulb className="inline-block mr-2 mb-1" />
                                                                Institutional Recommendation:
                                                            </p>
                                                            <p className="text-xs text-gray-700 font-bold mt-1 leading-relaxed">{issue.suggestion}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-8 bg-[#3f2b2b] flex gap-4">
                            <button className="flex-1 py-4 px-6 rounded-xl bg-[#b91c1c] text-white font-black text-xs uppercase tracking-widest border-2 border-white hover:bg-red-800 transition-all shadow-lg flex items-center justify-center gap-3">
                                <FaDownload /> Export Report
                            </button>
                            <button
                                className="flex-1 py-4 px-6 rounded-xl bg-transparent text-white font-black text-xs uppercase tracking-widest border-2 border-white/20 hover:border-white/50 transition-all flex items-center justify-center gap-3"
                                onClick={() => { setShowModal(false); setSelectedFile(null); setAnalysisResult(null); }}
                            >
                                <FaRedo /> New Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="py-8 bg-white border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">
                    TUP-Taguig &bull; Research Office &copy; {mounted ? new Date().getFullYear() : ''}
                </p>
            </footer>
        </div>
    );
};

export default DocumentsPage;
