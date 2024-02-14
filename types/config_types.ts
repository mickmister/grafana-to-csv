export type Query = {
    expression: string;
    name: string;
}

export type BaseConfig = {
    totalNumberOfRequests: number;
    numberOfDaysPerRequest: number;
    runQueries: number[];
    offsetDays: number;
}

export type Config = BaseConfig & {
    queries: Query[];
    jsonFolderName: string;
    csvFolderName: string;
}
