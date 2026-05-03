'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaArrowLeft, FaFileImage, FaTrash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

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
                            onClick={() => router.push('/documents')}
                            className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to workspace
                        </button>
                    </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Left Column: Form Card */}
                            <div className="lg:col-span-8">
                                <div className="bg-[#1E293B]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                                    <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4 ml-2">Research Title</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.title}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                        className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium outline-none shadow-sm text-white placeholder:text-white/10"
                                                        placeholder="Enter full formal research title"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4 ml-2">Lead Author</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.author}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                                        className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium outline-none shadow-sm text-white placeholder:text-white/10"
                                                        placeholder="Last Name, First Name M.I."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4 ml-2">Fiscal Year</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.year_range}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, year_range: e.target.value }))}
                                                        className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium outline-none shadow-sm text-white placeholder:text-white/10"
                                                        placeholder="e.g. 2024-2025"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4 ml-2">Course</label>
                                                    <div className="relative">
                                                        <CourseDropdown
                                                            value={formData.course}
                                                            options={DEPARTMENTS}
                                                            onChange={(val) => setFormData(prev => ({ ...prev, course: val }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4 ml-2">Assign Professor for Approval</label>
                                                    <select
                                                        required
                                                        value={formData.professorId}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, professorId: e.target.value }))}
                                                        className="w-full px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium outline-none shadow-sm text-white appearance-none"
                                                    >
                                                        <option value="" className="bg-[#1E293B]">Select a professor</option>
                                                        {professors.map((prof) => (
                                                            <option key={prof._id} value={prof._id} className="bg-[#1E293B]">
                                                                {prof.name} ({prof.idNumber})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4 ml-2">Abstract Summary</label>
                                                <textarea
                                                    required
                                                    value={formData.abstract}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                                                    className="w-full px-8 py-6 rounded-2xl bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/10 transition-all text-[14px] leading-relaxed font-medium outline-none min-h-[250px] shadow-sm resize-y text-white placeholder:text-white/10"
                                                    placeholder="Provide a comprehensive summary of the research..."
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
                                                            accept="image/*,application/pdf"
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
                                                                {attachments.map((file, index) => (
                                                                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group">
                                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                                            <FaFileImage className="text-primary flex-shrink-0" />
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
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                                            <div className="flex items-center gap-3 text-white/20">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Verification</span>
                                            </div>

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
                                                                <span>Processing...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaCloudUploadAlt className="text-sm" />
                                                                <span>Archive Record</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Right Column: Info / Guidelines */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Submission Guide</h3>
                                    <ul className="space-y-4">
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

                                <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8">
                                    <div className="flex items-center gap-3 mb-4 text-primary">
                                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <FaCloudUploadAlt className="text-sm" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Digital Archive</span>
                                    </div>
                                    <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                        Submitted research will undergo institutional verification before being cataloged in the TUPT Digital Repository.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
            </main>
        </div>
    );
};

export default CreateDocumentPage;
