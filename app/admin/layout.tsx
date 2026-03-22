'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LottieLoader from '@/app/components/UI/LottieLoader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const userDataString = localStorage.getItem('userData');
            const token = localStorage.getItem('token');

            if (!userDataString || !token) {
                // Wait 3 seconds to show the warning
                await new Promise(resolve => setTimeout(resolve, 3000));
                router.push('/auth/login');
                return;
            }

            try {
                const userData = JSON.parse(userDataString);
                if (!userData.isAdmin) {
                    // Wait 3 seconds to show the warning
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    router.push('/home');
                    return;
                }
                setIsAuthorized(true);
            } catch (error) {
                console.error('Auth check error:', error);
                await new Promise(resolve => setTimeout(resolve, 3000));
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="fixed inset-0 z-[999] bg-[#0A0A0F] flex items-center justify-center overflow-hidden">
                {/* Background Aesthetics to match the site */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 flex flex-col items-center gap-2"
                >
                    <LottieLoader 
                        type="warning"
                        width={300}
                        height={300}
                        text="Unauthorized Access"
                        subtext="You need to be logged on to access that page"
                    />
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
