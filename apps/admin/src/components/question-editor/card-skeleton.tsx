import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';

const QuestionCardSkeleton = () => {
    return (
        <Card className="p-0 overflow-hidden">
            <CardContent className="p-0 space-y-4 lg:space-y-6 xl:space-y-0 xl:grid xl:grid-cols-12 xl:gap-x-4 animate-pulse">
                <div className="xl:col-span-8 space-y-4 xl:space-y-0 p-6">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-2">
                            <div className="inline-flex flex-row gap-x-4">
                                <div className="h-[28px] rounded bg-slate-200 w-[120px]" />
                                <div className="h-[24px] rounded bg-slate-200 w-[80px]" />
                            </div>
                            <div className="ml-auto h-[32px] rounded bg-slate-200 w-[32px]" />
                        </CardTitle>
                    </CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <div className="space-y-2">
                                <div className="h-[16px] rounded bg-slate-200 w-[50px]" />
                                <div className="h-[40px] rounded bg-slate-200 w-full" />
                            </div>
                        </div>
                        <div className="md:col-span-6">
                            <div className="space-y-2">
                                <div className="h-[16px] rounded bg-slate-200 w-[80px]" />
                                <div className="h-[40px] rounded bg-slate-200 w-full" />
                            </div>
                        </div>
                        <div className="md:col-span-12">
                            <div className="space-y-2">
                                <div className="h-[16px] rounded bg-slate-200 w-[40px]" />
                                <div className="h-[30px] rounded bg-slate-200 w-[140px]" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-4 rounded bg-muted p-6">
                    <div className="h-[100px] rounded bg-slate-300 w-full" />
                </div>
            </CardContent>
        </Card>
    );
};

export default QuestionCardSkeleton;
