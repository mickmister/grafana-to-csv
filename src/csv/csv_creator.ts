import fs from 'fs/promises';

import configFile from '../../config.json';

const config: Config = configFile;

import {GrafanaResponseBody, Labels} from '../../types/grafana_types';
import {Config} from '../../types/config_types';

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
                continue;
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
        const firstLine = [
            legendName,
            ...dateRanges,
            '',
            'Relative Slope',
            'Last-First Ratio',
            'Last-Average Ratio',
            'Standard Deviation to Mean Ratio',
        ].join('|');

        const secondLine = [
            '',
            ...dateRanges.map((_, i) => i + 1), // 1, 2, 3, 4, 5. For slope x values
        ].join('|');

        const lines = [firstLine, secondLine];
        let realRowNum = 0;
        for (let rowNum = 0; rowNum < fieldValues.length; rowNum++) {
            const fieldValue = fieldValues[rowNum];
            const perField = allEntries[legendName][fieldValue];
            const line: string[] = [fieldValue];

            let containsEmptyColumn = false;
            for (let columnNum = 0; columnNum < parsedFiles.length; columnNum++) {
                const stored: number | undefined = perField[columnNum];
                if (!stored) {
                    containsEmptyColumn = true;
                    break;
                }

                line.push((stored || '') + '');
            }
            if (containsEmptyColumn) {
                continue;
            }

            const charCodeForLetterA = 'A'.charCodeAt(0);
            const startChar = String.fromCharCode(charCodeForLetterA + 1);
            const sheetsRowNum = realRowNum + 3;
            realRowNum++;

            const endIndex = charCodeForLetterA + parsedFiles.length;
            const endChar = String.fromCharCode(endIndex);
            const start = `${startChar}${sheetsRowNum}`;
            const end = `${endChar}${sheetsRowNum}`;

            line.push('');

            // Slope
            const slope = `=SLOPE(${start}:${end}, $B$2:$${endChar}$2) / AVERAGE(${start}:${end})`;
            line.push(slope);

            // Last-First Ratio
            const lastFirstRatio = `=${end}/${start}`;
            line.push(lastFirstRatio);

            // Last-Average Ratio
            const lastAverageRatio = `=${end} / AVERAGE(${start}:${end})`;
            line.push(lastAverageRatio);

            // Standard Deviation to Mean Ratio
            const stdev = `=STDEV(${start}:${end})/AVERAGE(${start}:${end})`;
            line.push(stdev);

            lines.push(line.join('|'));
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

export const runJobCreateCsv = async () => {
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
};
