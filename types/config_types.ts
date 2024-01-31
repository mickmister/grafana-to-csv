export type Query = {
    expression: string;
    name: string;
}

export type Config = {
    jsonFolderName: string;
    csvFolderName: string;
    totalNumberOfQueries: number;
    numberOfDaysPerQuery: number;
    queries: Query[];
}
