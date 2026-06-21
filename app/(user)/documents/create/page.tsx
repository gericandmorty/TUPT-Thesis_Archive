'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaArrowLeft, FaFileImage, FaTrash, FaCheckCircle, FaExclamationTriangle, FaFileAlt, FaTimes, FaQuestionCircle, FaChevronDown, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import CustomHeader from '@/app/components/Navigation/CustomHeader';
import Sidebar from '@/app/components/Navigation/Sidebar';
import Footer from '@/app/components/Navigation/Footer';
import CourseDropdown from '../components/CourseDropdown';

const DEPARTMENTS = [
    'BENG', 'BET', 'BETEM', 'BETICT', 'BETMC', 'BETMT', 'BETNT',
    'BSCE', 'BSECE', 'BSEE', 'BSES', 'BSIT', 'BSME',
    'BTAU', 'BTTE', 'BTVED', 'BTVTED'
];

const CreateDocumentPage: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isGuideExpanded, setIsGuideExpanded] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [professors, setProfessors] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        author: '',
        year_range: '',
        course: '',
        professorId: ''
    });
    const [attachments, setAttachments] = useState<File[]>([]);
    const [abstractFile, setAbstractFile] = useState<File | null>(null);

    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.isProfessor) {
                router.push('/approvals');
                return;
            }
        }
        checkExistingSubmissions();
        fetchProfessors();

        const prefilled = localStorage.getItem('prefilledThesisData');
        if (prefilled) {
            try {
                const parsed = JSON.parse(prefilled);
                setFormData(prev => ({
                    ...prev,
                    title: parsed.title || prev.title,
                    abstract: parsed.abstract || prev.abstract,
                    author: parsed.author || prev.author,
                    year_range: parsed.year_range || prev.year_range,
                    course: parsed.course || prev.course
                }));
                toast.success('Auto-populated solved data from Analysis Workspace!');
                localStorage.removeItem('prefilledThesisData');
            } catch (err) {
                console.error('Failed to load prefilled data:', err);
            }
        }
    }, [router]);

    const checkExistingSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/theses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                toast.info('You have already submitted a Research Article. Only one submission is allowed per level.');
                router.push('/documents/submissions');
            }
        } catch (err) {
            console.error('Error checking submissions:', err);
        }
    };

    const fetchProfessors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/professors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProfessors(data.data);
            }
        } catch (err) {
            console.error('Error fetching professors:', err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const rejected = newFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
            if (rejected.length > 0) {
                toast.error('PDF files are not allowed. Please upload DOCX or image files only.');
                return;
            }
            if (attachments.length + newFiles.length > 5) {
                toast.error('Maximum 5 supporting documents allowed');
                return;
            }
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };


    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleAbstractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
            toast.error('Only .txt files are accepted for abstract upload');
            return;
        }

        setAbstractFile(file);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const rawText = event.target?.result as string;
                const token = localStorage.getItem('token');
                
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/thesis/parse-txt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ text: rawText })
                });
                
                const data = await res.json();
                if (data.success && data.data?.abstract) {
                    setFormData(prev => ({ ...prev, abstract: data.data.abstract }));
                    toast.success('Abstract extracted and auto-filled from file!');
                } else {
                    toast.warn(data.message || 'Could not extract abstract content from the file.');
                }
            } catch (err) {
                console.error('Error fetching backend text parser:', err);
                toast.error('An error occurred while parsing the abstract file.');
            }
        };
        reader.readAsText(file);
        // Reset input so same file can be re-uploaded
        e.target.value = '';
    };

    const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Supported file types: PDF, DOCX, TXT
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        const isAllowedExtension = file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx');

        if (!allowedTypes.includes(file.type) && !isAllowedExtension) {
            toast.error('Only .pdf, .docx, and .txt files are accepted for auto-populating');
            return;
        }

        const toastId = toast.loading("Processing document, extracting metadata...");

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/thesis/parse-file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const resData = await res.json();
            if (!resData.success) {
                toast.update(toastId, {
                    render: resData.message || 'Error occurred while dissecting document.',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000
                });
                return;
            }

            const parsedData = resData.data || {};
            console.log("Parser Output from backend:", parsedData);

            setFormData(prev => ({
                ...prev,
                title: parsedData.title || prev.title,
                author: parsedData.author || prev.author,
                year_range: parsedData.year_range || prev.year_range,
                course: parsedData.course || prev.course,
                abstract: parsedData.abstract || prev.abstract
            }));

            const extracted = [];
            if (parsedData.title) extracted.push('Title');
            if (parsedData.author) extracted.push('Author');
            if (parsedData.year_range) extracted.push('Year');
            if (parsedData.course) extracted.push('Course');
            if (parsedData.abstract) extracted.push('Abstract');

            if (extracted.length > 0) {
                toast.update(toastId, {
                    render: `Dissected successfully! Auto-filled: ${extracted.join(', ')}`,
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000
                });
            } else {
                toast.update(toastId, {
                    render: 'Could not extract any metadata. Please fill the fields manually.',
                    type: 'warning',
                    isLoading: false,
                    autoClose: 3000
                });
            }
        } catch (err) {
            console.error("Error communicating with backend parser:", err);
            toast.update(toastId, {
                render: "An error occurred while communicating with the server.",
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            // Reset input value to allow re-uploading same file name if user updates it
            e.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (attachments.length === 0) {
            toast.error('Please upload at least one supporting document (Similarity, Proofreading, or Approval Sheet)');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            // Append text fields
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            // Append attachments
            attachments.forEach(file => {
                data.append('attachments', file);
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/theses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type, browser will set it with boundary
                },
                body: data
            });

            if (res.ok) {
                toast.success('Research Article and documents submitted for approval!');
                router.push('/documents');
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || 'Failed to submit Research Article');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            {mounted && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#2DD4BF]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                </div>
            )}

            <main className="relative z-10 flex-1 w-full pt-32 px-6 pb-24">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-none mb-3">
                                Submit <span className="text-primary">Research</span>
                            </h1>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Repository Archive Registration</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/documents')}
                            className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to workspace
                        </button>
                    </div>

                    {/* Expandable Submission Guide */}
                    <div className="mb-8 bg-[#1E293B]/40 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden group">
                        <button
                            type="button"
                            onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors text-left outline-none cursor-pointer"
                        >
                            <div className="flex items-center gap-3 text-primary">
                                <FaQuestionCircle className="text-sm" />
                                <span className="text-xs font-black uppercase tracking-widest">Submission Guide & Guidelines</span>
                            </div>
                            <FaChevronDown className={`text-white/40 text-xs transition-transform duration-300 ${isGuideExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence initial={false}>
                            {isGuideExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <div className="p-6 pt-0 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Left Side: Submission Guide Details */}
                                        <div className="space-y-4 pt-4">
                                            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {[
                                                    { title: 'Full Title', desc: 'Ensure the title matches the final approved manuscript.' },
                                                    { title: 'Abstract', desc: 'Summary should include background, methodology, and results.' },
                                                    { title: 'Authorship', desc: 'List authors according to contribution hierarchy.' }
                                                ].map((item, i) => (
                                                    <li key={i} className="space-y-1">
                                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">{item.title}</p>
                                                        <p className="text-[11px] text-white/40 leading-relaxed font-medium">{item.desc}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Right Side: Digital Archive Info */}
                                        <div className="pt-4">
                                            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 flex items-start gap-4 h-full">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                                    <FaCloudUploadAlt className="text-lg" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">Digital Archive</span>
                                                    <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                                        Submitted research will undergo institutional verification before being cataloged in the TUPT Digital Repository.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-[#1E293B]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                                <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                                    {/* Auto-Fill / Dissect Thesis TXT Box */}
                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 relative group/autofill">
                                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                                    <FaFileAlt className="text-lg animate-pulse" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-wider text-white">Auto-populate with Thesis Document</h4>
                                                    <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed font-medium">Upload a .pdf, .docx, or .txt of your paper to automatically extract title, author, year, course, and abstract!</p>
                                                </div>
                                            </div>
                                            <label className="px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex-shrink-0 text-center">
                                                Select File
                                                <input
                                                    type="file"
                                                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                                    onChange={handleMainFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4 ml-2">Research Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium outline-none shadow-sm text-white placeholder:text-white/30"
                                                    placeholder="Enter full formal research title"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-2 ml-2">Lead Author</label>
                                                <span className="block text-[10px] text-white/30 mb-3 ml-2 font-medium">For multiple authors, separate them with a comma (e.g., Dela Cruz J., Santos M.)</span>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.author}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                                    className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium outline-none shadow-sm text-white placeholder:text-white/30"
                                                    placeholder="Last Name, First Name M.I."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4 ml-2">Year</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.year_range}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, year_range: e.target.value }))}
                                                    className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium outline-none shadow-sm text-white placeholder:text-white/30"
                                                    placeholder="e.g. 2024-2025"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4 ml-2">Course</label>
                                                <div className="relative">
                                                    <CourseDropdown
                                                        value={formData.course}
                                                        options={DEPARTMENTS}
                                                        onChange={(val) => setFormData(prev => ({ ...prev, course: val }))}
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4 ml-2">Assign Faculty for Approval</label>
                                                <select
                                                    required
                                                    value={formData.professorId}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, professorId: e.target.value }))}
                                                    className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium outline-none shadow-sm text-white appearance-none"
                                                >
                                                    <option value="" className="bg-[#1E293B]">Select a faculty member</option>
                                                    {professors.map((prof) => (
                                                        <option key={prof._id} value={prof._id} className="bg-[#1E293B]">
                                                            {prof.name} ({prof.idNumber})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-4 ml-2">
                                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Abstract Summary</label>
                                                <label className="flex items-center gap-2 cursor-pointer group text-[10px] font-bold uppercase tracking-wider transition-colors text-white/30 hover:text-primary">
                                                    <FaFileAlt className="text-xs" />
                                                    <span>{abstractFile ? abstractFile.name : 'Upload .txt'}</span>
                                                    <input
                                                        type="file"
                                                        accept=".txt,text/plain"
                                                        onChange={handleAbstractFileChange}
                                                        className="hidden"
                                                    />
                                                    {abstractFile && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); setAbstractFile(null); }}
                                                            className="text-red-400/70 hover:text-red-400 ml-1"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    )}
                                                </label>
                                            </div>
                                            <textarea
                                                required
                                                value={formData.abstract}
                                                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                                                className="w-full px-8 py-6 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-[14px] leading-relaxed font-medium outline-none min-h-[250px] shadow-sm resize-y text-white placeholder:text-white/30"
                                                placeholder="Provide a comprehensive summary of the research, or upload a .txt file above to auto-fill..."
                                            />
                                        </div>

                                        {/* Supporting Documents Upload */}
                                        <div className="space-y-6 pt-6 border-t border-white/5">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Supporting Documents</h4>
                                                <p className="text-[11px] text-white/30 font-medium mb-6">Upload required certificates (Similarity, Proofreading, Approval Sheet). 1-5 images or PDFs required.</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <label className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-white/[0.04] transition-all cursor-pointer group">
                                                    <FaCloudUploadAlt className="text-3xl text-white/20 group-hover:text-primary transition-colors" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Select Files</span>
                                                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*,.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                </label>

                                                <div className="space-y-3">
                                                    {attachments.length === 0 ? (
                                                        <div className="h-full flex items-center justify-center rounded-3xl bg-white/[0.01] border border-white/5 p-8">
                                                            <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">No files selected</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                              {attachments.map((file, index) => {
                                                                  const getFileIcon = (fileName: string) => {
                                                                      const lowerName = fileName.toLowerCase();
                                                                      if (lowerName.endsWith('.pdf')) return <FaFilePdf className="text-rose-400 flex-shrink-0" />;
                                                                      if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) return <FaFileWord className="text-blue-400 flex-shrink-0" />;
                                                                      return <FaFileImage className="text-primary flex-shrink-0" />;
                                                                  };
                                                                  return (
                                                                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group">
                                                                          <div className="flex items-center gap-3 overflow-hidden">
                                                                              {getFileIcon(file.name)}
                                                                              <span className="text-[11px] font-medium text-white/60 truncate uppercase tracking-tighter">{file.name}</span>
                                                                          </div>
                                                                          <button
                                                                              type="button"
                                                                              onClick={() => removeAttachment(index)}
                                                                              className="p-2 text-white/20 hover:text-red-400 transition-colors"
                                                                          >
                                                                              <FaTrash size={12} />
                                                                          </button>
                                                                      </div>
                                                                  );
                                                              })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-8">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => router.push('/documents')}
                                                className="px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] text-white/30 hover:bg-white/5 hover:text-white transition-all active:scale-95"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`relative group px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all overflow-hidden active:scale-95 ${isSubmitting ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5'}`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                                <div className="flex items-center justify-center gap-3">
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            <span>Submitting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCloudUploadAlt className="text-sm" />
                                                            <span>Submit for Approval</span>
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </main>
                </div>
            );
        };

export default CreateDocumentPage;
