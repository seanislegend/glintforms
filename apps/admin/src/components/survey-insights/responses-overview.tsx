'use client';

import Checkbox from '@glint/form/checkbox';
import {Card, CardContent} from '@glint/ui/card';
import {Heading3} from '@glint/ui/heading';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@glint/ui/tabs';
import {parseAsBoolean, useQueryState} from 'nuqs';
import {formatDay} from '@/utils/format-day';
import {formatHour} from '@/utils/format-hour';
import ResponsesChart from './responses-chart';

interface Props {
    dayData: ResponsesDayDataPoint[];
    timeData: ResponsesTimeDataPoint[];
}

const ResponsesOverview: React.FC<Props> = ({dayData, timeData}) => {
    const [showAuthenticity, setShowAuthenticity] = useQueryState(
        'showAuthenticity',
        parseAsBoolean.withDefault(true)
    );
    const [showCompletionRate, setShowCompletionRate] = useQueryState(
        'showCompletionRate',
        parseAsBoolean.withDefault(true)
    );
    const [showLabels, setShowLabels] = useQueryState(
        'showLabels',
        parseAsBoolean.withDefault(true)
    );

    return (
        <Card>
            <CardContent>
                <Tabs defaultValue="day" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <Heading3>Response Overview</Heading3>
                        <div className="flex items-center gap-x-4">
                            <TabsList className="grid w-full grid-cols-2 gap-1">
                                <TabsTrigger value="day">Day of week</TabsTrigger>
                                <TabsTrigger value="time">Time of day</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                    <TabsContent value="time" className="mt-6">
                        <ResponsesChart
                            data={timeData}
                            lineDataKey="count"
                            showAuthenticity={showAuthenticity}
                            showCompletionRate={showCompletionRate}
                            showLabels={showLabels}
                            tooltipLabelFormatter={value => {
                                if (typeof value === 'number') {
                                    return formatHour(value);
                                }
                                return value;
                            }}
                            xAxis={{
                                dataKey: 'hour',
                                tickFormatter: value => {
                                    if (typeof value === 'number') {
                                        return formatHour(value);
                                    }
                                    return value;
                                }
                            }}
                        />
                    </TabsContent>
                    <TabsContent value="day" className="mt-6">
                        <ResponsesChart
                            data={dayData}
                            lineDataKey="count"
                            showAuthenticity={showAuthenticity}
                            showCompletionRate={showCompletionRate}
                            showLabels={showLabels}
                            tooltipLabelFormatter={value => {
                                if (typeof value === 'number') {
                                    return formatDay(value);
                                }
                                return value;
                            }}
                            xAxis={{
                                dataKey: 'dayOfWeek',
                                tickFormatter: value => {
                                    if (typeof value === 'number') {
                                        return formatDay(value);
                                    }
                                    return value;
                                }
                            }}
                        />
                    </TabsContent>
                </Tabs>
                <div className="flex justify-end items-center gap-4 mt-4">
                    <div className="flex items-center gap-x-2 flex-wrap">
                        <Checkbox
                            checked={showLabels ?? false}
                            id="show-labels"
                            onCheckedChange={checked => setShowLabels(checked)}
                        />
                        <label htmlFor="show-labels" className="text-sm shrink-0">
                            Show labels
                        </label>
                    </div>
                    <div className="flex items-center gap-x-2 flex-wrap">
                        <Checkbox
                            checked={showCompletionRate ?? false}
                            id="show-completion-rate"
                            onCheckedChange={checked => setShowCompletionRate(checked)}
                        />
                        <label htmlFor="show-completion-rate" className="text-sm shrink-0">
                            Show completion rate
                        </label>
                    </div>
                    <div className="flex items-center gap-x-2 flex-wrap">
                        <Checkbox
                            checked={showAuthenticity ?? false}
                            id="show-authenticity-rate"
                            onCheckedChange={checked => setShowAuthenticity(checked)}
                        />
                        <label htmlFor="show-authenticity-rate" className="text-sm shrink-0">
                            Show authenticity rate
                        </label>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ResponsesOverview;
