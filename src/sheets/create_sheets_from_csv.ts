import fs from 'fs/promises';

import {Config} from '../../types/config_types';
import {addDataToSheet, addMultipleSheets, createSpreadsheet, deleteSheet, freezeRows, getSpreadsheet, shareSpreadsheet} from './sheets_utils';
import {GOOGLE_SPREADSHEET_NAME} from './environment';

export const runJobCreateGoogleSheetFromCsv = async (config: Config) => {
    const topFolder = `./data/${config.csvFolderName}`;
    const csvFolders = await fs.readdir(topFolder);
    csvFolders.sort();
    const timestampedFolder = csvFolders.pop();
    const fullFolderName = `${topFolder}/${timestampedFolder}`;
    const csvFiles = await fs.readdir(fullFolderName);

    let spreadsheetName = GOOGLE_SPREADSHEET_NAME!;
    spreadsheetName += `_${config.offsetDays}_${config.numberOfDaysPerRequest}_${config.totalNumberOfRequests}`;

    let gSpreadsheet = await createSpreadsheet(spreadsheetName);

    console.log('Spreadsheet URL:', gSpreadsheet.data.spreadsheetUrl);
    fs.appendFile('./spreadsheet-urls.txt', '\n' + gSpreadsheet.data.spreadsheetUrl!);

    const spreadsheetId = gSpreadsheet.data.spreadsheetId!

    await shareSpreadsheet(spreadsheetId);

    await addMultipleSheets(spreadsheetId, csvFiles);

    gSpreadsheet = await getSpreadsheet(spreadsheetId);

    for (const fname of csvFiles) {
        console.log(`adding sheet ${fname}`);
        const fpath = `${fullFolderName}/${fname}`;

        const rawFileData = (await fs.readFile(fpath)).toString();

        const lines = rawFileData.split('\n').map(s => s.split('|'));

        await addDataToSheet(spreadsheetId, fname, lines);
        const sheet = gSpreadsheet.data.sheets!.find(s => s.properties!.title === fname);
        if (sheet) {
            await freezeRows(spreadsheetId, sheet.properties!.sheetId!, 2);
        } else {
            console.log(`Failed to freeze rows for sheet ${fname}`);
        }
    }

    const sheet = gSpreadsheet.data.sheets!.find(s => s.properties!.title === 'Sheet1');
    if (sheet) {
        console.log('Deleting default empty sheet in spreadsheet');
        await deleteSheet(spreadsheetId, sheet.properties!.sheetId!);
    } else {
        console.log('Failed to delete default empty sheet');
    }

    return gSpreadsheet;
};
