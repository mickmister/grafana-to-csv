require('dotenv').config();

import {runJobCreateGoogleSheetFromCsv} from './create_sheets_from_csv';

setTimeout(async () => {
    console.log('creating spreadsheet');

    const spreadsheet = await runJobCreateGoogleSheetFromCsv();
    console.log('Spreadsheet URL:', spreadsheet.data.spreadsheetUrl);
});
