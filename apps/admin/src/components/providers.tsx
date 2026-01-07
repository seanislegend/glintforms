import {NuqsAdapter} from 'nuqs/adapters/next/app';
import {TRPCReactProvider} from '@/lib/trpc/react';

interface Props {
    locale: Locale;
}

const AppProviders: React.FC<React.PropsWithChildren<Props>> = ({children, locale}) => (
    <TRPCReactProvider locale={locale}>
        <NuqsAdapter>{children}</NuqsAdapter>
    </TRPCReactProvider>
);

export default AppProviders;
