// import {GoogleSpreadsheet} from 'google-spreadsheet';

import {google} from 'googleapis';

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

export const shareSpreadsheet = async (spreadsheetId: string, userEmail: string) => {
    try {
        await drive.permissions.create({
            requestBody: {
                // type: 'domain',
                // domain: 'mydomain.com',
                type: 'user',
                emailAddress: userEmail,
                role: 'writer',
            },
            fileId: spreadsheetId,
            fields: 'id',
            sendNotificationEmail: false,
        });

        console.log(`Spreadsheet shared with user: ${userEmail}`);
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

export const deleteSpreadsheet = async (spreadsheetId: string) => {
    try {
        await drive.files.delete({
            fileId: spreadsheetId,
        });

        console.log(`spreadsheet ${spreadsheetId} deleted`);
    } catch (error) {
        console.error('Error sharing spreadsheet:', error);
    }
}
