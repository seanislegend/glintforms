import {Heading1} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
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
                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                    {survey.description}
                </p>
                <Suspense>
                    <div className="flex items-center gap-y-2 gap-x-4 text-sm text-accent-foreground">
                        <span>
                            <RecordId id={survey.id} />
                        </span>
                        <span>
                            <strong>Campaign:</strong>{' '}
                            <TextLink href={`/campaigns/${survey.campaign?.id}`}>
                                {survey.campaign?.title}
                            </TextLink>
                        </span>
                        <span>•</span>
                        <span>
                            <strong>Created:</strong> <RelativeDate date={survey.createdAt} />
                        </span>
                        <span>•</span>
                        <span>
                            <strong>Launched:</strong>{' '}
                            {survey.launchedAt ? (
                                <RelativeDate date={new Date(survey.launchedAt)} />
                            ) : (
                                'Pending'
                            )}
                        </span>
                    </div>
                </Suspense>
            </div>
        </div>
    );
};

export default SurveyOverviewHeader;
