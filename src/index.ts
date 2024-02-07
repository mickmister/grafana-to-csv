require('dotenv').config();

import {Config} from '../types/config_types';

import configFile from '../config.json';
import {runJobFetchData} from './grafana/job';
import {runJobCreateCsv} from './sheets/csv_creator';

let config: Config = configFile;

setTimeout(async () => {
    await runJobFetchData(config);
    await runJobCreateCsv();

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
