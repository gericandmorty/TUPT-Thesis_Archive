import React from 'react';
import { FaFileAlt, FaHistory, FaArrowRight, FaClock, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
    if (drafts.length === 0) return null;

    return (
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                    <FaHistory className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Saved <span className="text-amber-500">Drafts</span></h3>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Continue where you left off</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                {drafts.map((draft, idx) => {
                    const completion = Math.round((draft.appliedIssueIds.length / (draft.originalResults?.totalIssues || 1)) * 100);
                    
                    return (
                        <motion.div 
                            key={draft._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => onResume(draft)}
                            className="group relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/[0.08] hover:border-primary/30 transition-all cursor-pointer overflow-hidden flex items-center gap-6"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                            
                            <div className="relative w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5 group-hover:border-primary/20 shadow-xl">
                                <FaFileAlt className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0 relative">
                                <h4 className="text-white font-black text-[13px] uppercase tracking-tight truncate mb-2 group-hover:text-primary transition-colors">
                                    {draft.fileName}
                                </h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                        <FaClock className="w-2.5 h-2.5 text-white/20" />
                                        {new Date(draft.lastSaved).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="h-3 w-[1px] bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${completion}%` }} />
                                        </div>
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                            {completion}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative p-3 rounded-xl bg-white/5 text-white/20 group-hover:text-white group-hover:bg-primary group-hover:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all">
                                <FaArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default DraftsList;
