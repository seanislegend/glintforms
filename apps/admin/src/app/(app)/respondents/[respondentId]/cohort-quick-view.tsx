'use client';

import {Sheet, SheetDescription, SheetHeader, SheetPopup, SheetTitle} from '@glint/ui/sheet';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {useQueryState} from 'nuqs';
import {Suspense} from 'react';
import CohortDetails from '@/app/(app)/cohorts/[cohortId]/cohort-details';

const CohortQuickView = () => {
    const [cohortId, setCohortId] = useQueryState('cohortId');

    return (
        <Sheet open={!!cohortId} onOpenChange={() => setCohortId(null)}>
            <SheetPopup className="w-[400px] sm:w-[800px] xl:w-[1000px] max-w-none sm:max-w-none xl:max-w-none">
                <SheetHeader className="sticky top-0 bg-white/70 backdrop-blur-lg">
                    <SheetTitle>Cohort details</SheetTitle>
                    <SheetDescription>View the details of a cohort.</SheetDescription>
                </SheetHeader>
                <div className="px-4 flex-grow overflow-auto">
                    {cohortId && (
                        <Suspense
                            fallback={
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <SpinnerGapIcon className="animate-spin" /> Fetching cohort...
                                </div>
                            }
                        >
                            <CohortDetails cohortId={cohortId} />
                        </Suspense>
                    )}
                </div>
            </SheetPopup>
        </Sheet>
    );
};

export default CohortQuickView;

