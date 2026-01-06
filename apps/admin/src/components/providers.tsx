import {NuqsAdapter} from 'nuqs/adapters/next/app';
import {TRPCReactProvider} from '@/lib/trpc/react';

const AppProviders: React.FC<React.PropsWithChildren> = ({children}) => (
    <TRPCReactProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
    </TRPCReactProvider>
);

export default AppProviders;
