export const GOOGLE_USER_EMAIL = process.env.GOOGLE_USER_EMAIL;
export const GOOGLE_DOMAIN = process.env.GOOGLE_DOMAIN;
if (!GOOGLE_USER_EMAIL && !GOOGLE_DOMAIN) {
    console.log('Please provide Google user email to share the spreadsheet with, via env var GOOGLE_USER_EMAIL. Or provide a Google domain to share the spreadsheet, via env var GOOGLE_DOMAIN.');
    process.exit(0);
}

export const GOOGLE_SPREADSHEET_NAME = process.env.GOOGLE_SPREADSHEET_NAME;
if (!GOOGLE_SPREADSHEET_NAME) {
    console.log('Please provide a spreadsheet name via env var GOOGLE_SPREADSHEET_NAME');
    process.exit(0);
}
