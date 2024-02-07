import fs from 'fs/promises';

import configFile from '../../config.json';

const config: Config = configFile;

import {Config} from '../../types/config_types';
import {addDataToSheet, addMultipleSheets, createSpreadsheet, shareSpreadsheet} from './sheets_utils';

export const runJobCreateGoogleSheetFromCsv = async (userEmail: string) => {
    const topFolder = `./data/${config.csvFolderName}`;
    const csvFolders = await fs.readdir(topFolder);
    csvFolders.sort();
    const timestampedFolder = csvFolders.pop();
    const fullFolderName = `${topFolder}/${timestampedFolder}`;
    const csvFiles = await fs.readdir(fullFolderName);

    const gSpreadsheet = await createSpreadsheet('My Spreadsheet');
    console.log('Spreadsheet URL:', gSpreadsheet.data.spreadsheetUrl);
    fs.appendFile('./spreadsheet-urls.txt', '\n' + gSpreadsheet.data.spreadsheetUrl!);

    await shareSpreadsheet(gSpreadsheet.data.spreadsheetId!, userEmail);

    await addMultipleSheets(gSpreadsheet.data.spreadsheetId!, csvFiles);

    for (const fname of csvFiles) {
        console.log(`adding sheet ${fname}`);
        const fpath = `${fullFolderName}/${fname}`;

        const rawFileData = (await fs.readFile(fpath)).toString();

        const lines = rawFileData.split('\n').map(s => s.split(','));

        await addDataToSheet(gSpreadsheet.data.spreadsheetId!, fname, lines);
    }

    return gSpreadsheet;
};
