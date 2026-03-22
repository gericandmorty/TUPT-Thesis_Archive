'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const userDataString = localStorage.getItem('userData');
            const token = localStorage.getItem('token');

            if (!userDataString || !token) {
                router.push('/auth/login');
                return;
            }

            try {
                const userData = JSON.parse(userDataString);
                if (!userData.isAdmin) {
                    router.push('/home');
                    return;
                }
                setIsAuthorized(true);
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden">
                {/* Background Aesthetics to match the site */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 flex flex-col items-center gap-8"
                >
                    <div className="relative">
                        <div className="w-20 h-20 border-2 border-primary/20 rounded-2xl animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-0 w-20 h-20 border-t-2 border-primary rounded-2xl animate-[spin_1.5s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-2">Authenticating</h2>
                        <p className="text-xs font-bold text-white/20 tracking-widest italic">Verifying administrative credentials...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
