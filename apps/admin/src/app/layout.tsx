import type {Metadata} from 'next';
import './global.css';
import {Toaster} from '@glint/ui/sonner';
import {cn} from '@glint/ui/utils';
import {GeistMono} from 'geist/font/mono';
import {GeistSans} from 'geist/font/sans';
import AppProviders from '@/components/providers';

export const metadata: Metadata = {
    title: 'Glint - Ethical AI Research Platform',
    description:
        'Data points that shine, insights that catch the eye. Build, deploy and analyse surveys with AI assistance.',
    keywords: ['research', 'surveys', 'ai', 'ethics', 'data collection'],
    authors: [{name: 'Glint Team'}]
};

const RootLayout: React.FC<React.PropsWithChildren> = ({children}) => {
    return (
        <html
            lang="en"
            className={cn('bg-sidebar antialiased', GeistSans.variable, GeistMono.variable)}
        >
            <head>
                {process.env.NEXT_PUBLIC_ENABLE_REACT_SCAN === '1' && (
                    <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
                )}
            </head>
            <body className="bg-background text-foreground">
                <div className="min-h-screen bg-background">
                    <AppProviders>{children}</AppProviders>
                </div>
                <Toaster richColors />
            </body>
        </html>
    );
};

export default RootLayout;
