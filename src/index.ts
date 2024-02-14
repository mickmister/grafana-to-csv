require('dotenv').config();

import {BaseConfig, Config} from '../types/config_types';

import configFile from '../config.json';
import {runJobFetchData} from './grafana/job';
import {runJobCreateCsv} from './csv/csv_creator';
import {runJobCreateGoogleSheetFromCsv} from './sheets/create_sheets_from_csv';

const initialConfig: Config = configFile;

setTimeout(async () => {
    /*
        - 2 week periods for:
            - 14 requests = 7 months
            - offset before holidays, 12 requests = 6 months
            - offset before holidays, 6 requests = 3 months
        - 1 week periods
            - 6 requests = 6 weeks
            - 24 requests = 6 months
            - offset before holidays, 24 requests = 6 months
            - offset before holidays, 12 requests = 3 months
    */

    const runConfigs: BaseConfig[] = [
        {
            numberOfDaysPerRequest: 14,
            totalNumberOfRequests: 16,
            offsetDays: 0,
            runQueries: [0, 3],
        },
        {
            numberOfDaysPerRequest: 14,
            totalNumberOfRequests: 12,
            offsetDays: 56,
            runQueries: [0, 3],
        },
        {
            numberOfDaysPerRequest: 14,
            totalNumberOfRequests: 6,
            offsetDays: 56,
            runQueries: [0, 3],
        },
        {
            numberOfDaysPerRequest: 7,
            totalNumberOfRequests: 6,
            offsetDays: 0,
            runQueries: [0, 3],
        },
        {
            numberOfDaysPerRequest: 7,
            totalNumberOfRequests: 24,
            offsetDays: 0,
            runQueries: [0, 3],
        },
        {
            numberOfDaysPerRequest: 7,
            totalNumberOfRequests: 24,
            offsetDays: 56,
            runQueries: [0, 3],
        },
        {
            numberOfDaysPerRequest: 7,
            totalNumberOfRequests: 12,
            offsetDays: 56,
            runQueries: [0, 3],
        },
    ];

    for (const runConfig of runConfigs) {
        const fullConfig = {
            ...initialConfig,
            ...runConfig,
        };

        await runJobFetchData(fullConfig);
        await runJobCreateCsv();

        const spreadsheet = await runJobCreateGoogleSheetFromCsv(fullConfig);
        console.log('Spreadsheet URL:', spreadsheet.data.spreadsheetUrl);
    }
});
