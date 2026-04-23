import React, { useState } from 'react';
import { FaFileAlt, FaArrowRight, FaLightbulb, FaEdit, FaTrash } from 'react-icons/fa';
import DeleteThesisModal from './DeleteThesisModal';

interface Thesis {
    _id: string;
    title: string;
    author: string;
    year_range?: string;
    course?: string;
    isApproved: boolean;
    professorId?: {
        name: string;
    };
    approvedBy?: {
        name: string;
        isAdmin?: boolean;
    };
    approvedAt?: string;
}

interface MySubmissionsProps {
    myTheses: Thesis[];
    onViewThesis: (id: string) => void;
    onEditThesis: (thesis: Thesis) => void;
    onDeleteThesis: (id: string) => void;
    hasAnalysisOrFile: boolean;
}

const MySubmissions: React.FC<MySubmissionsProps> = ({ myTheses, onViewThesis, onEditThesis, onDeleteThesis, hasAnalysisOrFile }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [thesisToDelete, setThesisToDelete] = useState<Thesis | null>(null);

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
                            className="group relative bg-[#F8FAFC] rounded-lg border border-zinc-200 shadow-lg p-8 flex flex-col h-[520px] transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="relative z-10 flex-grow">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200/60">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                        {thesis.course || 'General'}
                                    </span>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${thesis.isApproved
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                        }`}>
                                        {thesis.isApproved ? 'Approved' : 'Pending'}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-zinc-900 leading-snug">
                                        {thesis.title}
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Author</span>
                                            <p className="text-[11px] text-zinc-700 font-medium">
                                                {thesis.author}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Year</span>
                                            <p className="text-[11px] text-zinc-700 font-medium">
                                                {thesis.year_range || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-zinc-100">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Professor</span>
                                            <p className="text-[11px] text-zinc-700 font-medium">
                                                {thesis.professorId?.name || 'Unassigned'}
                                            </p>
                                        </div>
                                        
                                        {thesis.isApproved && thesis.approvedBy && (
                                            <div className="space-y-3 pt-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Approved By</span>
                                                        <p className="text-[11px] text-zinc-800 font-semibold">{thesis.approvedBy.name}</p>
                                                    </div>
                                                    <span className="text-[9px] text-zinc-400 font-medium italic">
                                                        {thesis.approvedAt ? new Date(thesis.approvedAt).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 pt-6 mt-auto">
                                <button
                                    className={`w-full py-3 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${thesis.isApproved 
                                        ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'}`}
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
        </section>
    );
};

export default MySubmissions;
