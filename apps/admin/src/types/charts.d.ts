interface ResponsesBaseDataPoint {
    count: number;
    completed: number;
    passed: number;
}

interface ResponsesTimeDataPoint extends ResponsesBaseDataPoint {
    hour: string;
}

interface ResponsesDayDataPoint extends ResponsesBaseDataPoint {
    dayOfWeek: string;
}
