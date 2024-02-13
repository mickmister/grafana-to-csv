// import {GoogleSpreadsheet} from 'google-spreadsheet';

import {google} from 'googleapis';

import {GOOGLE_DOMAIN, GOOGLE_USER_EMAIL} from './environment';

console.log('creating google auth');
const auth = new google.auth.GoogleAuth({
    keyFile: './_debug/esp-performance-tracking-auth.json',
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
    ],
});

console.log('creating sheets api');

const sheets = google.sheets({version: 'v4', auth});

console.log('creating drive api');

const drive = google.drive({version: 'v3', auth});

export const addMultipleSheets = async (spreadsheetId: string, sheetTitles: string[]): Promise<void> => {
    const sheets = google.sheets({version: 'v4', auth});

    const requests = sheetTitles.map(title => ({
        addSheet: {
            properties: {
                title,
            },
        },
    }));

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests,
        },
    });

    console.log('Sheets added successfully.');
}

export const populateSheetsWithData = async (spreadsheetId: string, dataForSheets: {title: string, data: string[][]}[]): Promise<void> => {
    const sheets = google.sheets({version: 'v4', auth});

    const data = dataForSheets.map(sheet => ({
        range: `${sheet.title}!A1`,
        values: sheet.data,
    }));

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: 'USER_ENTERED',
            data,
        },
    });

    console.log('Data added to sheets successfully.');
}

export const addDataToSheet = async (spreadsheetId: string, sheetTitle: string, data: string[][]) => {
    await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetTitle}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: data,
        },
    });
}

export const shareSpreadsheet = async (spreadsheetId: string) => {
    let args: {type: 'domain'; domain: string} | {type: 'user'; emailAddress: string};
    if (GOOGLE_USER_EMAIL) {
        args = {
            type: 'user',
            emailAddress: GOOGLE_USER_EMAIL,
        };
    } else if (GOOGLE_DOMAIN) {
        args = {
            type: 'domain',
            domain: GOOGLE_DOMAIN,
        };
    } else {
        throw new Error('No Google email or domain provided');
    }

    try {
        await drive.permissions.create({
            requestBody: {
                ...args,
                role: 'writer',
            },
            fileId: spreadsheetId,
            fields: 'id',
            sendNotificationEmail: false,
        });

        console.log(`Spreadsheet shared with: ${GOOGLE_USER_EMAIL || GOOGLE_DOMAIN}`);
    } catch (error) {
        console.error('Error sharing spreadsheet:', error);
    }
}

export const createSpreadsheet = async (title: string) => {
    const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title,
            },
        },
    });

    return spreadsheet;
}

export const getSpreadsheet = async (spreadsheetId: string) => {
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
    });

    return spreadsheet;
}

export const deleteSpreadsheet = async (spreadsheetId: string) => {
    try {
        await drive.files.delete({
            fileId: spreadsheetId,
        });

        console.log(`spreadsheet ${spreadsheetId} deleted`);
    } catch (error) {
        console.error('Error deleting spreadsheet:', error);
    }
}

export const deleteSheet = async (spreadsheetId: string, sheetId: number) => {
    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteSheet: {
                        sheetId,
                        // spreadsheetId,
                        // sheetId,
                    },
                }],
            },
        });
    } catch (error) {
        console.error('Error deleting sheet:', error);
    }
}

export const freezeRows = async (spreadsheetId: string, sheetId: number, numberOfRowsToFreeze: number) => {
    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    updateSheetProperties: {
                        properties: {
                            sheetId,
                            gridProperties: {
                                frozenRowCount: numberOfRowsToFreeze,
                            },
                        },
                        fields: 'gridProperties.frozenRowCount'
                    },
                }],
            },
        });
    } catch (error) {
        console.error('Error freezing rows:', error);
    }
}
