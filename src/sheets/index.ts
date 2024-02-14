require('dotenv').config();

import {runJobCreateGoogleSheetFromCsv} from './create_sheets_from_csv';

import configFile from '../../config.json';
import {Config} from '../../types/config_types';

const config: Config = configFile;

setTimeout(async () => {
    console.log('creating spreadsheet');

    const spreadsheet = await runJobCreateGoogleSheetFromCsv(config);
    console.log('Spreadsheet URL:', spreadsheet.data.spreadsheetUrl);
});
