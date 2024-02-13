require('dotenv').config();

import {Config} from '../../types/config_types';

import configFile from '../../config.json';
import {runJobFetchData} from '../grafana/job';

const config: Config = configFile;

setTimeout(async () => {
    await runJobFetchData(config);
});
