'use client';

import Button from '@glint/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import {Heading3, Heading5} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import {t} from '@/lib/i18n';
import {PencilIcon} from '@phosphor-icons/react/dist/ssr/Pencil';
import {useSuspenseQuery} from '@tanstack/react-query';
import Link from '@glint/ui/link';
import {DataTable} from '@/components/data-table';
import {useTRPC} from '@/lib/trpc/react';
import {COUNTRY_CODE_LABELS} from '@/utils/country-codes';
import {surveyColumns} from './survey-columns';

interface Props {
    screenerId: string;
}

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'age':
            return t('Age');
        case 'location':
            return t('Location');
        case 'selection':
            return t('Selection');
        default:
            return type;
    }
};

const renderConfig = (type: string, config: unknown) => {
    if (type === 'age') {
        const ageConfig = config as {operator: 'over' | 'under'; value: number};
        return `${ageConfig.operator} ${ageConfig.value}`;
    }
    if (type === 'location') {
        const locationConfig = config as {countries: string[]};
        return locationConfig.countries.map(code => COUNTRY_CODE_LABELS[code] || code).join(', ');
    }
    if (type === 'selection') {
        const selectionConfig = config as {
            options: Array<{id: string; passes: boolean; value: string}>;
            question: string;
        };
        return (
            <div className="space-y-2">
                <p className="text-sm font-medium">{selectionConfig.question}</p>
                <ul className="list-disc list-inside space-y-1">
                    {selectionConfig.options.map(opt => (
                        <li className={`text-sm ${opt.passes ? 'font-semibold' : ''}`} key={opt.id}>
                            {opt.value}
                            {opt.passes && ` (${t('passes')})`}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    return JSON.stringify(config);
};

const ScreenerDetails: React.FC<Props> = ({screenerId}) => {
    const trpc = useTRPC();
    const {data: screener} = useSuspenseQuery(trpc.screeners.get.queryOptions(screenerId));

    if (!screener) {
        return (
            <EmptyPanel
                text={t("The screener you're looking for doesn't exist or has been removed.")}
                title={t('Screener not found')}
            />
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('Screener information')}</CardTitle>
                    <Link href={`/screeners/${screenerId}/edit`}>
                        <Button size="sm" variant="outline">
                            <PencilIcon className="size-4" />
                            {t('Edit')}
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        {t('Name')}
                                    </Heading5>
                                    <p className="text-sm">{screener.name}</p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        {t('Type')}
                                    </Heading5>
                                    <p className="text-sm">{getTypeLabel(screener.type)}</p>
                                </div>
                                {screener.description && (
                                    <div className="md:col-span-2">
                                        <Heading5 className="text-muted-foreground">
                                            {t('Description')}
                                        </Heading5>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {screener.description}
                                        </p>
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <Heading5 className="text-muted-foreground">
                                        {t('Configuration')}
                                    </Heading5>
                                    <div className="text-sm">
                                        {renderConfig(screener.type, screener.config)}
                                    </div>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        {t('Created')}
                                    </Heading5>
                                    <p className="text-sm">
                                        <RelativeDate date={new Date(screener.createdAt)} />
                                    </p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        {t('Last updated')}
                                    </Heading5>
                                    <p className="text-sm">
                                        <RelativeDate date={new Date(screener.updatedAt)} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-8">
                <Heading3 className="mb-4">{t('Used in surveys')}</Heading3>
                {screener.surveys && screener.surveys.length > 0 ? (
                    <DataTable
                        columns={surveyColumns}
                        data={screener.surveys}
                        hasPagination={false}
                        inputFilterKey={null}
                    />
                ) : (
                    <EmptyPanel
                        text={t("This screener hasn't been assigned to any surveys yet.")}
                        title={t('No surveys assigned')}
                    />
                )}
            </div>
        </>
    );
};

export default ScreenerDetails;
