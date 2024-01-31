export type Query = {
    expression: string;
    name: string;
}

export type Config = {
    jsonFolderName: string;
    csvFolderName: string;
    totalNumberOfRequests: number;
    numberOfDaysPerRequest: number;
    queries: Query[];
    runQueries: number[];
    offsetDays: number;
}
