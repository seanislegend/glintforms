'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@glint/ui/table';

interface ScreenerFailure {
    failureCount: number;
    screenerId: string;
    screenerName: string;
    screenerType: 'age' | 'location' | 'selection';
}

interface ScreenerFailureStats {
    failuresByScreener: ScreenerFailure[];
    totalFailures: number;
}

interface Props {
    screenerStats: ScreenerFailureStats | undefined;
    surveyScreeners: unknown[] | undefined;
}

const ScreenerFailures: React.FC<Props> = ({screenerStats, surveyScreeners}) => {
    if (!surveyScreeners || surveyScreeners.length === 0 || !screenerStats) {
        return null;
    }

    const hasFailures =
        screenerStats.totalFailures > 0 && screenerStats.failuresByScreener.length > 0;
    if (!hasFailures) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Screener failures</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Screener</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Failures</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {screenerStats.failuresByScreener.map(failure => (
                            <TableRow key={failure.screenerId}>
                                <TableCell>{failure.screenerName}</TableCell>
                                <TableCell className="capitalize">
                                    {failure.screenerType.replace('_', ' ')}
                                </TableCell>
                                <TableCell className="text-right">{failure.failureCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ScreenerFailures;
