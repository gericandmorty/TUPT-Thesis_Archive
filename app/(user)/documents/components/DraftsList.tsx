import React, { useState } from 'react';
import { FaFileAlt, FaHistory, FaArrowRight, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Draft {
    _id: string;
    fileName: string;
    lastSaved: string;
    appliedIssueIds: string[];
    originalResults: any;
    localPagesText: any[];
}

interface DraftsListProps {
    drafts: Draft[];
    onResume: (draft: Draft) => void;
}

const DraftsList: React.FC<DraftsListProps> = ({ drafts, onResume }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4; // Render 4 drafts per page in a 2-column grid

    if (drafts.length === 0) return null;

    const totalPages = Math.ceil(drafts.length / ITEMS_PER_PAGE);
    const activePage = Math.min(currentPage, totalPages) || 1;
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    const currentDrafts = drafts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                        <FaHistory className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Saved <span className="text-amber-500">Drafts</span></h3>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Continue where you left off</p>
                    </div>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={activePage === 1}
                            className={`p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 transition-all ${activePage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Previous Page"
                        >
                            <FaChevronLeft className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">
                            {activePage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={activePage === totalPages}
                            className={`p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 transition-all ${activePage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Next Page"
                        >
                            <FaChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {currentDrafts.map((draft) => {
                            const completion = Math.round((draft.appliedIssueIds.length / (draft.originalResults?.totalIssues || 1)) * 100);
                            
                            return (
                                <div 
                                    key={draft._id}
                                    onClick={() => onResume(draft)}
                                    className="group relative bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 rounded-2xl hover:bg-white/[0.06] hover:border-primary/30 transition-all cursor-pointer overflow-hidden flex items-center gap-6"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                                    
                                    <div className="relative w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5 group-hover:border-primary/20 shadow-xl flex-shrink-0">
                                        <FaFileAlt className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0 relative">
                                        <h4 className="text-white font-black text-[13px] uppercase tracking-tight truncate mb-2 group-hover:text-primary transition-colors" title={draft.fileName}>
                                            {draft.fileName}
                                        </h4>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-white/30 uppercase tracking-widest flex-shrink-0 whitespace-nowrap">
                                                <FaClock className="w-2.5 h-2.5 text-white/20" />
                                                {new Date(draft.lastSaved).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="h-3 w-[1px] bg-white/10 flex-shrink-0" />
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${completion}%` }} />
                                                </div>
                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                                    {completion}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative p-3 rounded-xl bg-white/5 text-white/20 group-hover:text-white group-hover:bg-primary group-hover:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all flex-shrink-0">
                                        <FaArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};

export default DraftsList;
