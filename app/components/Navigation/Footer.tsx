'use client';

import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-16 bg-card/5 backdrop-blur-md border-t border-white/10 relative z-10 w-full overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#2DD4BF]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.4em] text-center">
                            Technological University of the Philippines &bull; Taguig
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-6">
                            <a 
                                href="/privacy-policy" 
                                className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-primary transition-all duration-300 cursor-pointer underline underline-offset-4 decoration-white/20 hover:decoration-primary"
                            >
                                Privacy Policy
                            </a>
                            <span className="text-white/20 text-xs">&bull;</span>
                            <a 
                                href="/terms-of-service" 
                                className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-primary transition-all duration-300 cursor-pointer underline underline-offset-4 decoration-white/20 hover:decoration-primary"
                            >
                                Terms of Service
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-px w-16 bg-white/5" />
                            <span className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em] whitespace-nowrap">
                                &copy; {new Date().getFullYear()} TUPT ARCHIVE
                            </span>
                            <div className="h-px w-16 bg-white/5" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
