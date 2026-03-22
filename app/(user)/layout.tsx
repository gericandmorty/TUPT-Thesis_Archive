'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LottieLoader from '@/app/components/UI/LottieLoader';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('userData');

            if (!token || !userData) {
                // Wait 3 seconds to show the warning
                await new Promise(resolve => setTimeout(resolve, 3000));
                router.push('/auth/login');
                return;
            }

            // For user routes, we just need them to be logged in.
            // Admin can also access these routes as they are registered users.
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="fixed inset-0 z-[999] bg-[#0A0A0F] flex items-center justify-center overflow-hidden">
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
