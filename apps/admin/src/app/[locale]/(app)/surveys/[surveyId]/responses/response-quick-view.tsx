'use client';

import {Sheet, SheetDescription, SheetHeader, SheetPopup, SheetTitle} from '@glint/ui/sheet';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {useParams} from 'next/navigation';
import {useQueryState} from 'nuqs';
import {Suspense} from 'react';
import ResponseDetails from './[responseId]/response-details';

const ResponseQuickView = () => {
    const {surveyId} = useParams<{surveyId: string}>();
    const [responseId, setResponseId] = useQueryState('responseId');

    return (
        <Sheet open={!!responseId} onOpenChange={() => setResponseId(null)}>
            <SheetPopup className="w-[400px] sm:w-[800px] xl:w-[1000px] max-w-none sm:max-w-none xl:max-w-none">
                <SheetHeader className="sticky top-0 bg-white/70 backdrop-blur-lg">
                    <SheetTitle>Response details</SheetTitle>
                    <SheetDescription>View the details of a response.</SheetDescription>
                </SheetHeader>
                <div className="px-4 flex-grow overflow-auto">
                    {responseId && (
                        <Suspense
                            fallback={
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <SpinnerGapIcon className="animate-spin" /> Fetching response...
                                </div>
                            }
                        >
                            <ResponseDetails responseId={responseId} surveyId={surveyId} />
                        </Suspense>
                    )}
                </div>
            </SheetPopup>
        </Sheet>
    );
};

export default ResponseQuickView;
