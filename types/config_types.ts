export type Query = {
    expression: string;
    name: string;
}

export type BaseConfig = {
    jsonFolderName: string;
    csvFolderName: string;
    totalNumberOfRequests: number;
    numberOfDaysPerRequest: number;
    runQueries: number[];
    offsetDays: number;
}

export type Config = BaseConfig & {
    queries: Query[];
}
