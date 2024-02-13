require('dotenv').config();

import {Config} from '../types/config_types';

import configFile from '../config.json';
import {runJobFetchData} from './grafana/job';
import {runJobCreateCsv} from './csv/csv_creator';
import {runJobCreateGoogleSheetFromCsv} from './sheets/create_sheets_from_csv';

let config: Config = configFile;

setTimeout(async () => {
    await runJobFetchData(config);
    await runJobCreateCsv();

    const spreadsheet = await runJobCreateGoogleSheetFromCsv();
    console.log('Spreadsheet URL:', spreadsheet.data.spreadsheetUrl);

    /*
        let baseConfig: BaseConfig = {
            runQueries: [],
            jsonFolderName: 'json-out',
            csvFolderName: 'csv-out',
            totalNumberOfRequests: 12,
            numberOfDaysPerRequest: 14,
            offsetDays: 0
        }

        config = {
            ...config,
            ...baseConfig,
        };

        baseConfig = {
            csvFolderName: config.csvFolderName + '-1',
            jsonFolderName: config.csvFolderName + '-1',
            numberOfDaysPerRequest: config.numberOfDaysPerRequest,
            offsetDays: config.numberOfDaysPerRequest,
            runQueries: [],
            totalNumberOfRequests: config.totalNumberOfRequests,
        };
        config = {
            ...config,
            ...baseConfig,
        }

        await runJobFetchData(config);
        await runJobCreateCsv();
    */
});
