'use client';

import Container from '@glint/ui/container';
import EmptyPanel from '@glint/ui/empty-panel';
import {Heading4} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import {useQuery} from '@tanstack/react-query';
import RecordId from '@/components/record-id';
import {useTRPC} from '@/lib/trpc/react';

interface FormProps {
    respondentId: string;
}

const RespondentSummary: React.FC<FormProps> = ({respondentId}) => {
    const trpc = useTRPC();
    const {data: respondent, isLoading} = useQuery(trpc.respondents.get.queryOptions(respondentId));

    if (isLoading) {
        return <div>Fetching details...</div>;
    } else if (!respondent) {
        return (
            <EmptyPanel
                text="The respondent you're looking for doesn't exist or has been removed."
                title="Respondent not found"
            />
        );
    }

    return (
        <Container>
            <Heading4 className="mb-4">Summary</Heading4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">ID</dt>
                    <dd>
                        <RecordId id={respondent.id} />
                    </dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Created at</dt>
                    <dd className="text-sm">
                        <RelativeDate date={new Date(respondent.createdAt)} />
                    </dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Updated at</dt>
                    <dd className="text-sm">
                        <RelativeDate date={new Date(respondent.updatedAt)} />
                    </dd>
                </div>
                {respondent.gender && (
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">Gender</dt>
                        <dd className="text-sm capitalize">{respondent.gender}</dd>
                    </div>
                )}
                {respondent.locationCity && (
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">
                            Location city
                        </dt>
                        <dd className="text-sm">{respondent.locationCity}</dd>
                    </div>
                )}
                {respondent.locationCountry && (
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">
                            Location country
                        </dt>
                        <dd className="text-sm">{respondent.locationCountry}</dd>
                    </div>
                )}
                {respondent.signupSource && (
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">
                            Signup source
                        </dt>
                        <dd className="text-sm capitalize">{respondent.signupSource}</dd>
                    </div>
                )}
                {respondent.notes && (
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground mb-1">Notes</dt>
                        <dd className="text-sm whitespace-pre-wrap">{respondent.notes}</dd>
                    </div>
                )}
            </dl>
        </Container>
    );
};

export default RespondentSummary;
