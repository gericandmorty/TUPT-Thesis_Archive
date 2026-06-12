import React, { useState } from 'react';
import { FaFileAlt, FaArrowRight, FaLightbulb, FaEdit, FaTrash, FaFileImage, FaTimes, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteThesisModal from './DeleteThesisModal';

interface Thesis {
    _id: string;
    title: string;
    author: string;
    year_range?: string;
    course?: string;
    isApproved: boolean;
    isProfApproved: boolean;
    professorId?: {
        name: string;
    };
    approvedBy?: {
        name: string;
        isAdmin?: boolean;
    };
    approvedAt?: string;
    attachments?: string[];
    isRejected?: boolean;
    rejectedByRole?: 'faculty' | 'librarian';
    deleteAt?: string;
}

interface MySubmissionsProps {
    myTheses: Thesis[];
    onViewThesis: (id: string) => void;
    onEditThesis: (thesis: Thesis) => void;
    onDeleteThesis: (id: string) => void;
    hasAnalysisOrFile: boolean;
}

const getDaysRemaining = (deleteAtStr?: string) => {
    if (!deleteAtStr) return 5;
    const diffTime = new Date(deleteAtStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

const MySubmissions: React.FC<MySubmissionsProps> = ({ myTheses, onViewThesis, onEditThesis, onDeleteThesis, hasAnalysisOrFile }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [thesisToDelete, setThesisToDelete] = useState<Thesis | null>(null);
    const [selectedAttachments, setSelectedAttachments] = useState<string[] | null>(null);

    const handleDeleteClick = (thesis: Thesis) => {
        setThesisToDelete(thesis);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (thesisToDelete) {
            onDeleteThesis(thesisToDelete._id);
            setIsDeleteModalOpen(false);
            setThesisToDelete(null);
        }
    };

    return (
        <section className="max-w-6xl mx-auto px-6 py-10 md:py-20 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-16 px-4">
                <div className="flex items-center gap-6">
                    <div className="w-1.5 h-12 bg-primary rounded-full shadow-[0_0_15px_rgba(45,212,191,0.3)]" />
                    <div>
                        <h2 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-1">Institutional Archive</h2>
                        <h3 className="text-3xl font-black text-white tracking-tight uppercase">My Research <span className="text-primary italic">Portfolio</span></h3>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md">
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {myTheses.length} Entries
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Digital Records</span>
                </div>
            </div>

            {myTheses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myTheses.map((thesis) => (
                        <div
                            key={thesis._id}
                            className="group relative bg-white/[0.02] hover:bg-white/[0.04] rounded-[2rem] border border-white/10 hover:border-primary/30 shadow-2xl p-8 flex flex-col h-[520px] transition-all duration-500 hover:-translate-y-1"
                        >
                            <div className="relative z-10 flex-grow">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                        {thesis.course || 'General'}
                                    </span>
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                        ID: {thesis._id.substring(0, 8).toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xl font-black text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
                                        {thesis.title}
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Author</span>
                                            <p className="text-[11px] text-white/70 font-semibold truncate">
                                                {thesis.author}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Year</span>
                                            <p className="text-[11px] text-white/70 font-semibold">
                                                {thesis.year_range || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Faculty Reviewer</span>
                                            <p className="text-[11px] text-white/70 font-semibold truncate">
                                                {thesis.professorId?.name || 'Unassigned'}
                                            </p>
                                        </div>
                                        
                                        {thesis.isApproved && thesis.approvedBy && (
                                            <div className="space-y-2 pt-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Approved By</span>
                                                        <p className="text-[10px] text-white/80 font-bold">{thesis.approvedBy.name}</p>
                                                    </div>
                                                    <span className="text-[9px] text-white/30 font-medium italic">
                                                        {thesis.approvedAt ? new Date(thesis.approvedAt).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Alert Banner */}
                                    <div className="pt-2">
                                        {thesis.isApproved ? (
                                            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                                                <FaCheckCircle className="text-sm flex-shrink-0" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Approved & Cataloged</span>
                                            </div>
                                        ) : thesis.isRejected ? (
                                            <div className="flex items-start gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                                                <FaExclamationTriangle className="text-sm mt-0.5 flex-shrink-0 animate-pulse" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-black uppercase tracking-wider block">
                                                        Rejected by {thesis.rejectedByRole === 'faculty' ? 'Faculty' : 'Librarian'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-rose-400/70 uppercase tracking-widest block mt-0.5">
                                                        Auto-deletes in {getDaysRemaining(thesis.deleteAt)} days
                                                    </span>
                                                </div>
                                            </div>
                                        ) : thesis.isProfApproved ? (
                                            <div className="flex items-start gap-3 px-4 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                                                <FaClock className="text-sm mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-black uppercase tracking-wider block">Accepted by Faculty</span>
                                                    <span className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest block mt-0.5">Pending Librarian Review</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                                                <FaClock className="text-sm flex-shrink-0" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Awaiting Faculty Approval</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 pt-6 mt-auto flex items-center gap-3 border-t border-white/5">
                                {thesis.attachments && thesis.attachments.length > 0 && (
                                    <button
                                        onClick={() => setSelectedAttachments(thesis.attachments!)}
                                        className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:bg-primary/10 border border-white/10 hover:border-primary/30 transition-all duration-300 group/attach"
                                        title="View Supporting Documents"
                                    >
                                        <FaFileImage className="group-hover/attach:scale-110 transition-transform" />
                                    </button>
                                )}
                                {!thesis.isApproved && (
                                    <>
                                        <button
                                            onClick={() => onEditThesis(thesis)}
                                            className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:bg-primary/10 border border-white/10 hover:border-primary/30 transition-all duration-300"
                                            title="Edit Submission"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(thesis)}
                                            className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all duration-300"
                                            title="Delete Submission"
                                        >
                                            <FaTrash />
                                        </button>
                                    </>
                                )}
                                <button
                                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                        thesis.isApproved 
                                            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
                                            : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                    }`}
                                    onClick={() => onViewThesis(thesis._id)}
                                    disabled={!thesis.isApproved}
                                >
                                    {thesis.isApproved ? 'View Research' : 'Under Review'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !hasAnalysisOrFile && (
                <div className="bg-[#1E293B]/40 backdrop-blur-2xl rounded-[3rem] p-16 md:p-24 text-center border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/5 group-hover:border-primary/20 transition-all duration-700">
                            <FaFileAlt className="text-4xl text-white/10 group-hover:text-primary/40 transition-colors duration-700" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">No Archive Entries</h3>
                        <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto mb-10">
                            Your institutional records will be cataloged here.
                        </p>
                    </div>
                </div>
            )}

            <DeleteThesisModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                thesisTitle={thesisToDelete?.title || ''}
            />

            {/* Attachment Viewer Modal */}
            <AnimatePresence>
                {selectedAttachments && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-xl"
                            onClick={() => setSelectedAttachments(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-[2rem] border border-zinc-200 overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Supporting <span className="text-primary italic">Documents</span></h2>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-1">Uploaded Certificates & Sheets</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedAttachments(null)}
                                    className="w-12 h-12 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-all border border-zinc-200"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {selectedAttachments.map((url, i) => (
                                        <div key={i} className="group relative rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 aspect-square">
                                            <img 
                                                src={url} 
                                                alt={`Attachment ${i + 1}`} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                <a 
                                                    href={url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 transition-all"
                                                >
                                                    Full Resolution
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default MySubmissions;
