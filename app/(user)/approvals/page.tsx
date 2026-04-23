'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaCheck, 
    FaTimes, 
    FaEye, 
    FaGraduationCap, 
    FaCalendarAlt, 
    FaFolderOpen,
    FaArrowLeft 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/app/lib/api';

const ApprovalsPage = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [assignedTheses, setAssignedTheses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchAssignedTheses();
    }, []);

    const fetchAssignedTheses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/thesis/assigned`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAssignedTheses(data.data);
            }
        } catch (err) {
            console.error('Error fetching assigned theses:', err);
            toast.error('Failed to load pending approvals');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string, title: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/thesis/${id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success(`"${title}" has been approved!`);
                fetchAssignedTheses();
            } else {
                toast.error('Failed to approve thesis');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        }
    };

    const handleDisapprove = async (id: string, title: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/thesis/${id}/disapprove`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.warn(`"${title}" has been disapproved.`);
                fetchAssignedTheses();
            } else {
                toast.error('Failed to disapprove thesis');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white pt-32 px-6 pb-16">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <main className="relative z-10 max-w-6xl mx-auto w-full">
                {/* Header Section */}
                <div className="mb-12">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push('/home')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all mb-6 group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                                Pending <span className="text-primary italic">Approvals</span>
                            </h1>
                            <p className="text-white/40 text-sm font-medium tracking-wide max-w-xl">
                                FACULTY REVIEW PANEL • MANAGE STUDENT RESEARCH SUBMISSIONS
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <FaFolderOpen className="text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Pending</p>
                                <p className="text-xl font-black text-white leading-none">{assignedTheses.length}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 gap-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Loading Assignments...</p>
                        </div>
                    ) : assignedTheses.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {assignedTheses.map((thesis, index) => (
                                <motion.div
                                    key={thesis._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-[#1E293B]/40 hover:bg-[#1E293B]/60 border border-white/5 hover:border-white/20 rounded-[2rem] p-8 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Status Badge */}
                                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest ${thesis.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {thesis.isApproved ? 'Approved' : 'Awaiting Review'}
                                    </div>

                                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                                        {/* Info Block */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-wider">{thesis.course}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/30">
                                                    <FaCalendarAlt className="text-[10px]" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{thesis.year_range}</span>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors cursor-pointer"
                                                onClick={() => router.push(`/search_result?id=${thesis._id}`)}
                                            >
                                                {thesis.title}
                                            </h3>

                                            <div className="flex items-center gap-4 text-white/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                                                        <FaGraduationCap className="text-xs" />
                                                    </div>
                                                    <span className="text-xs font-bold">{thesis.author}</span>
                                                </div>
                                            </div>

                                            <p className="text-white/40 text-xs leading-relaxed line-clamp-2 max-w-3xl">
                                                {thesis.abstract}
                                            </p>
                                        </div>

                                        {/* Action Block */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <button
                                                onClick={() => router.push(`/search_result?id=${thesis._id}`)}
                                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group/btn"
                                                title="View Details"
                                            >
                                                <FaEye className="text-white/50 group-hover/btn:text-white transition-colors" />
                                            </button>
                                            
                                            <div className="h-10 w-px bg-white/5 mx-2" />

                                            <button
                                                onClick={() => handleDisapprove(thesis._id, thesis.title)}
                                                disabled={!thesis.isApproved && false /* Allow disapproving even if already pending to refresh state */}
                                                className="px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-30"
                                            >
                                                <FaTimes /> Reject
                                            </button>

                                            <button
                                                onClick={() => handleApprove(thesis._id, thesis.title)}
                                                disabled={thesis.isApproved}
                                                className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                                                    thesis.isApproved 
                                                    ? 'bg-green-500/20 border border-green-500/20 text-green-500 cursor-default'
                                                    : 'bg-primary text-[#0F172A] hover:shadow-primary/20 hover:scale-105'
                                                }`}
                                            >
                                                <FaCheck /> {thesis.isApproved ? 'Approved' : 'Approve Research'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#1E293B]/20 border border-dashed border-white/10 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center px-6"
                        >
                            <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8">
                                <FaFolderOpen className="text-4xl text-white/10" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">All Caught Up!</h3>
                            <p className="text-white/30 text-sm max-w-sm font-medium leading-relaxed">
                                There are currently no research papers assigned to you waiting for approval. New submissions will appear here.
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ApprovalsPage;
