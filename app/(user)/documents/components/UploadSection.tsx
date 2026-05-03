import React from 'react';
import { FaCloudUploadAlt, FaFileAlt, FaTimes, FaSearch, FaUpload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LottieLoader from '@/app/components/UI/LottieLoader';

interface UploadSectionProps {
    isDragging: boolean;
    selectedFile: File | null;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearFile: () => void;
    onUpload: () => void;
    onOpenSubmitModal: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
    isDragging,
    selectedFile,
    isUploading,
    fileInputRef,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
    onClearFile,
    onUpload,
    onOpenSubmitModal
}) => {
    return (
        <section className="max-w-4xl mx-auto px-6 mb-16 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden group bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl shadow-black/40"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                <div className="p-4">
                    <div
                        className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-700 flex flex-col items-center justify-center text-center overflow-hidden
                            ${isDragging
                                ? 'border-primary/50 bg-primary/5 scale-[0.99]'
                                : 'border-white/5 hover:border-white/10'
                            }
                            ${selectedFile ? 'border-transparent bg-white/[0.03]' : ''}
                        `}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        <AnimatePresence mode="wait">
                            {!selectedFile ? (
                                <motion.div 
                                    key="upload-prompt"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative z-10 w-full max-w-sm mx-auto"
                                >
                                    <div className="w-24 h-24 mx-auto mb-10 relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                                        <div className="relative w-full h-full bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                                            <FaCloudUploadAlt className={`text-4xl text-primary transition-transform duration-500 ${isDragging ? '-translate-y-2' : 'group-hover:-translate-y-1'}`} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">Check Document</h3>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
                                        Drop your file here or click to browse
                                    </p>
                                    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={onFileSelect}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt"
                                    />
                                    
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-5 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_-10px_rgba(45,212,191,0.4)] hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <FaUpload className="text-[10px]" /> Select Document
                                    </button>
                                    
                                    <div className="mt-8 flex items-center justify-center gap-3">
                                        <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">PDF</span>
                                        <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">DOCX</span>
                                        <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">TXT</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="file-selected"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="w-full max-w-sm mx-auto text-center relative z-10"
                                >
                                    <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-xl group/icon">
                                        <FaFileAlt className="text-3xl text-primary group-hover/icon:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-3 uppercase tracking-tight line-clamp-1" title={selectedFile.name}>
                                        {selectedFile.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-3 mb-10">
                                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                        <p className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                                            Ready to Scan
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            className="p-4 rounded-2xl bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10"
                                            onClick={(e) => { e.stopPropagation(); onClearFile(); }}
                                            title="Cancel"
                                        >
                                            <FaTimes />
                                        </button>
                                        {isUploading && <LottieLoader isModal type="search" text="Checking your thesis..." />}

                                        <button
                                            className={`flex-1 py-5 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_-10px_rgba(45,212,191,0.4)] hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 ${isUploading ? 'opacity-90 cursor-wait' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); onUpload(); }}
                                            disabled={isUploading}
                                        >
                                            <FaSearch className="text-[10px]" /> Start Scan
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 px-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(45,212,191,0.5)] animate-pulse" />
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">
                                System Ready
                            </p>
                        </div>
                        <button
                            onClick={onOpenSubmitModal}
                            className="text-white/40 font-black text-[9px] uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 px-6 py-3 rounded-xl transition-all flex items-center gap-3 border border-white/5 group"
                        >
                            <FaUpload className="text-[10px] group-hover:-translate-y-0.5 transition-transform" /> 
                            Submit Final Version
                        </button>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default UploadSection;
