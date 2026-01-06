'use client';

import Container from '@glint/ui/container';
import EmptyPanel from '@glint/ui/empty-panel';
import {Heading4} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import Spacer from '@glint/ui/spacer';
import {t} from '@/lib/i18n';
import {useQuery} from '@tanstack/react-query';
import DeleteScreenerDialog from '@/components/dialogs/delete/screener';
import RecordId from '@/components/record-id';
import {useTRPC} from '@/lib/trpc/react';

interface FormProps {
    screenerId: string;
}

const ScreenerSummary: React.FC<FormProps> = ({screenerId}) => {
    const trpc = useTRPC();
    const {data: screener, isLoading} = useQuery(trpc.screeners.get.queryOptions(screenerId));

    if (isLoading) {
        return <div>{t('Fetching details...')}</div>;
    } else if (!screener) {
        return (
            <EmptyPanel
                text={t("The screener you're looking for doesn't exist or has been removed.")}
                title={t('Screener not found')}
            />
        );
    }

    return (
        <Container>
            <Heading4 className="mb-4">{t('Summary')}</Heading4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">{t('ID')}</dt>
                    <dd className="text-sm">
                        <RecordId id={screener.id} />
                    </dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">{t('Created at')}</dt>
                    <dd className="text-sm">
                        <RelativeDate date={new Date(screener.createdAt)} />
                    </dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">{t('Updated at')}</dt>
                    <dd className="text-sm">
                        <RelativeDate date={new Date(screener.updatedAt)} />
                    </dd>
                </div>
            </dl>
            <Spacer />
            <DeleteScreenerDialog screenerId={screenerId} />
        </Container>
    );
};

export default ScreenerSummary;
