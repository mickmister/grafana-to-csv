import fs from 'fs/promises';

import configFile from './config.json';

const config: Config = configFile;

import originalFileData from './data/multi/two weeks/now-14d.json';
import {GrafanaResponseBody, Labels} from './types/grafana_types';
import {Config} from './types/config_types';

const fileData: GrafanaResponseBody = originalFileData;

type Entry = {
    fieldName: string;
    fieldValue: string;
    value: number;
}

const getFieldFromLabels = (labels: Labels): [string, string] => {
    const keys = Object.keys(labels);
    const key = keys[0];
    const value = labels[key];
    return [key, value];
};

type ParsedEntries = {
    [legendName: string]: Entry[];
}

const parseIntoEntries = (fdata: GrafanaResponseBody): ParsedEntries => {
    const allEntries: ParsedEntries = {};
    const legendNames = Object.keys(fdata.results);
    for (const legendName of legendNames) {
        const frames = fdata.results[legendName]!.frames;
        for (const frame of frames) {
            if (!frame.schema.fields[1]) {
                console.log(frame.schema);
                console.log('Error parsing data entry. Please see the logs above.');
                process.exit(0);
            }
            const [fieldName, fieldValue] = getFieldFromLabels(frame.schema.fields[1].labels!);
            const value = frame.data.values[1][0];
            const entry: Entry = {
                fieldName,
                fieldValue,
                value,
            };

            allEntries[legendName] ||= [];
            allEntries[legendName].push(entry);
        };
    }

    return allEntries;
}

type CsvObject = {
    legendName: string;
    data: string;
}

const formatCsv = (parsedFiles: ParsedEntriesWithDateRange[]): CsvObject[] => {
    const out: CsvObject[] = [];
    const allEntries: Record<string, Record<string, Record<string, number>>> = {};

    parsedFiles.forEach((parsedFile, i) => {
        for (const legendName of Object.keys(parsedFile.entries)) {
            const entries = parsedFile.entries[legendName];
            allEntries[legendName] ||= {};
            for (const entry of entries) {
                allEntries[legendName][entry.fieldValue] ||= {};
                allEntries[legendName][entry.fieldValue][i + ''] = entry.value;
            }
        }
    });

    for (const legendName of Object.keys(allEntries)) {
        const fieldValues = Object.keys(allEntries[legendName]);

        const dateRanges = parsedFiles.map((f) => f.dateRange);
        const firstLine = [legendName, ...dateRanges, 'Comparison'].join(',,');
        const lines = [firstLine];
        for (let rowNum = 0; rowNum < fieldValues.length; rowNum++) {
            const fieldValue = fieldValues[rowNum];
            const perField = allEntries[legendName][fieldValue];
            const line: string[] = [fieldValue];
            for (let columnNum = 0; columnNum < parsedFiles.length; columnNum++) {
                const stored: number | undefined = perField[columnNum];
                line.push((stored || '') + '');
            }

            const A = 'A'.charCodeAt(0);
            const startChar = String.fromCharCode(A + 2);
            const endChar = String.fromCharCode(A + parsedFiles.length * 2);
            const sheetsRowNum = rowNum + 2;
            const comparisonCell = `=${endChar}${sheetsRowNum}/${startChar}${sheetsRowNum}`;
            line.push(comparisonCell);

            lines.push(line.join(',,'));
        }

        const joinedLines = lines.join('\n');
        out.push({legendName, data: joinedLines});
    }

    return out;
}

type ParsedEntriesWithDateRange = {
    dateRange: string;
    entries: ParsedEntries;
}

setTimeout(async () => {
    const allFileData: ParsedEntriesWithDateRange[] = [];

    const topFolder = `./data/${config.jsonFolderName}`;
    const jsonFolders = await fs.readdir(topFolder);
    jsonFolders.sort();
    const timestampedFolder = jsonFolders.pop();
    const fullFolderName = `${topFolder}/${timestampedFolder}`;
    const entryFiles = await fs.readdir(fullFolderName);

    for (const fname of entryFiles) {
        const fpath = `${fullFolderName}/${fname}`;

        const rawFileData = (await fs.readFile(fpath)).toString();
        const fileData = JSON.parse(rawFileData) as GrafanaResponseBody;
        const entries = parseIntoEntries(fileData);

        const startIndex = config.jsonFolderName.length + 1;
        const endIndex = fname.length - '.json'.length;
        const dateRange = fname.substring(startIndex, endIndex);

        allFileData.push({
            dateRange,
            entries,
        });
    }

    const allCsvData = formatCsv(allFileData);

    const iso = new Date().toISOString();
    for (const csvData of allCsvData) {
        const folderName = `./data/csv-out/${iso}`;
        const outputFileName = `${folderName}/${csvData.legendName}.csv`;
        await fs.mkdir(folderName, {recursive: true});

        await fs.writeFile(outputFileName, csvData.data);
    }
});
