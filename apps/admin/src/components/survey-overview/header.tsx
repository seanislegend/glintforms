import {Heading1} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
import {t} from '@/lib/i18n';
import {Suspense} from 'react';
import RecordId from '@/components/record-id';

interface Props {
    survey: SurveyDetails;
}

const SurveyOverviewHeader: React.FC<Props> = ({survey}) => {
    return (
        <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
                <Heading1>{survey.title}</Heading1>
                <p className="text-xl leading-relaxed max-w-screen-2xl">{survey.description}</p>
                <Suspense>
                    <div className="flex items-center gap-y-2 gap-x-4 text-sm text-accent-foreground">
                        <span>
                            <RecordId id={survey.id} />
                        </span>
                        <span>
                            <strong>{t('Campaign:')}</strong>{' '}
                            <TextLink href={`/campaigns/${survey.campaign?.id}`}>
                                {survey.campaign?.title}
                            </TextLink>
                        </span>
                        <span>•</span>
                        <span>
                            <strong>{t('Created:')}</strong>{' '}
                            <RelativeDate date={survey.createdAt} />
                        </span>
                        <span>•</span>
                        <span>
                            <strong>{t('Launched:')}</strong>{' '}
                            {survey.launchedAt ? (
                                <RelativeDate date={new Date(survey.launchedAt)} />
                            ) : (
                                t('Pending')
                            )}
                        </span>
                    </div>
                </Suspense>
            </div>
        </div>
    );
};

export default SurveyOverviewHeader;
