require('dotenv').config();

import fs from 'node:fs';

import {runJobCreateGoogleSheetFromCsv} from './create_sheets_from_csv';

const GOOGLE_USER_EMAIL = process.env.GOOGLE_USER_EMAIL;
if (!GOOGLE_USER_EMAIL) {
    console.log('Please provide Google user email to share the spreadsheet with, via env var GOOGLE_USER_EMAIL');
    process.exit(0);
}

setTimeout(async () => {
    console.log('creating spreadsheet');

    const spreadsheet = await runJobCreateGoogleSheetFromCsv(GOOGLE_USER_EMAIL);
    console.log('Spreadsheet URL:', spreadsheet.data.spreadsheetUrl);
});
