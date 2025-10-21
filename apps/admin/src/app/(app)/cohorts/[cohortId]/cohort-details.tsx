'use client';

import Button from '@glint/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import {Heading5} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import {PencilIcon} from '@phosphor-icons/react/dist/ssr/Pencil';
import {useSuspenseQuery} from '@tanstack/react-query';
import Link from 'next/link';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    cohortId: string;
}

const CohortDetails: React.FC<Props> = ({cohortId}) => {
    const trpc = useTRPC();
    const {data: cohort} = useSuspenseQuery(trpc.cohorts.get.queryOptions(cohortId));

    if (!cohort) {
        return (
            <EmptyPanel
                text="The cohort you're looking for doesn't exist or has been removed."
                title="Cohort not found"
            />
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Cohort information</CardTitle>
                    <Link href={`/cohorts/${cohortId}/edit`}>
                        <Button size="sm" variant="outline">
                            <PencilIcon className="size-4" />
                            Edit
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Heading5 className="text-muted-foreground">Name</Heading5>
                                    <p className="text-sm">{cohort.name}</p>
                                </div>
                                {cohort.description && (
                                    <div className="mt-4">
                                        <Heading5 className="text-muted-foreground">
                                            Description
                                        </Heading5>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {cohort.description}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <Heading5 className="text-muted-foreground">Created</Heading5>
                                    <p className="text-sm">
                                        <RelativeDate date={new Date(cohort.createdAt)} />
                                    </p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        Last updated
                                    </Heading5>
                                    <p className="text-sm">
                                        <RelativeDate date={new Date(cohort.updatedAt)} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-8"></div>
        </>
    );
};

export default CohortDetails;
