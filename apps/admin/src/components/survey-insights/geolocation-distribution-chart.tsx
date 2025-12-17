'use client';

import {BasicCard} from '@glint/ui/card';
import {type ChartConfig, ChartContainer, ChartTooltip} from '@glint/ui/chart';
import {Tooltip, TooltipPopup, TooltipTrigger} from '@glint/ui/tooltip';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import {Cell, Pie, PieChart} from 'recharts';
import {COUNTRY_CODE_LABELS} from '@/utils/country-codes';

interface GeolocationDistributionData {
    count: number;
    country: string | null;
}

interface Props {
    data: GeolocationDistributionData[];
}

const chartConfig = {
    0: {color: 'var(--color-blue-500)'},
    1: {color: 'var(--color-red-500)'},
    2: {color: 'var(--color-green-500)'},
    3: {color: 'var(--color-yellow-500)'},
    4: {color: 'var(--color-purple-500)'}
} satisfies ChartConfig;

const GeolocationDistributionChart: React.FC<Props> = ({data}) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <BasicCard title="Geolocation Distribution">
            <Tooltip>
                <TooltipTrigger className="absolute top-4 right-4 lg:top-6 lg:right-6">
                    <InfoIcon className="size-4" />
                </TooltipTrigger>
                <TooltipPopup>
                    <p>
                        Geolocations are inferred from the IP address of the user and may not be
                        accurate.
                    </p>
                </TooltipPopup>
            </Tooltip>
            <ChartContainer config={chartConfig} className="aspect-square h-[300px] w-full">
                <PieChart
                    accessibilityLayer
                    data={data}
                    margin={{top: 20, right: 20, bottom: 20, left: 20}}
                >
                    <ChartTooltip
                        content={({active, payload}) => {
                            if (!active || !payload?.length) {
                                return null;
                            }

                            const item = payload[0];
                            const percentage =
                                total > 0 ? Math.round((item.value / total) * 100) : 0;

                            return (
                                <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                                    <div className="font-medium">
                                        {item.payload.geolocation
                                            ? COUNTRY_CODE_LABELS[item.payload.geolocation]
                                            : 'Unknown location'}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-[2px]"
                                                style={{
                                                    backgroundColor: item.payload.fill
                                                }}
                                            />
                                            <span>
                                                {item.value} responses ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="geolocation"
                        cx="50%"
                        cy="50%"
                        label
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={0}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${entry.country || 'unknown'}`}
                                fill={
                                    entry.country
                                        ? chartConfig[index as keyof typeof chartConfig]?.color
                                        : 'var(--color-slate-200)'
                                }
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
            <footer>
                <ul className="flex flex-row flex-wrap gap-y-2 gap-x-6">
                    {data.map((entry, index) => (
                        <li key={entry.country} className="inline-flex items-center gap-2 text-sm">
                            <div
                                className="h-2.5 w-2.5 rounded-[2px]"
                                style={{
                                    backgroundColor:
                                        chartConfig[index as keyof typeof chartConfig]?.color
                                }}
                            />
                            <span>
                                {entry.country
                                    ? COUNTRY_CODE_LABELS[entry.country]
                                    : 'Unknown location'}
                            </span>
                        </li>
                    ))}
                </ul>
            </footer>
        </BasicCard>
    );
};

export default GeolocationDistributionChart;
