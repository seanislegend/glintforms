import {FormField} from '@glint/form/fields';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@glint/ui/card';
import Spinner from '@glint/ui/spinner';
import {useQuery} from '@tanstack/react-query';
import {useFormContext} from 'react-hook-form';
import {useTRPC} from '@/lib/trpc/react';

const RespondentCohorts: React.FC = () => {
    const trpc = useTRPC();
    const {data: cohorts, isPending} = useQuery(trpc.cohorts.getAll.queryOptions());
    const {control} = useFormContext();

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Cohorts</CardTitle>
                <CardDescription>
                    Assign cohorts to this respondent to segment them into different groups for
                    reporting and analysis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPending && <Spinner />}
                {!isPending && (!cohorts || !cohorts?.length) && (
                    <p className="text-muted-foreground text-sm">
                        Once you create a cohort, you can assign it to this respondent here.
                    </p>
                )}
                {cohorts && cohorts?.length > 0 && (
                    <FormField
                        control={control}
                        label="Cohorts"
                        name="cohortIds"
                        fieldType="checkbox-group"
                        options={cohorts?.map(cohort => ({
                            label: cohort.name,
                            value: cohort.id
                        }))}
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default RespondentCohorts;
