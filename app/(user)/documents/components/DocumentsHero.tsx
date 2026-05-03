import React from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt } from 'react-icons/fa';

const DocumentsHero: React.FC = () => {
    return (
        <section className="relative pt-0 pb-2 px-6 max-w-5xl mx-auto text-center z-10">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
            >
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                    <FaFileAlt className="text-primary text-[10px]" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Thesis Helper</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase leading-[0.9]">
                    Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Analyzer</span>
                </h1>
                
                <p className="text-white/40 text-xs md:text-sm max-w-xl mx-auto font-bold uppercase tracking-[0.4em] leading-relaxed">
                    Smart feedback to help you perfect your thesis.
                </p>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Check • Improve • Submit</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
                </div>
            </motion.div>
        </section>
    );
};

export default DocumentsHero;
