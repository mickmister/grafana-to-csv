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

const formatCsv = (parsedFiles: ParsedEntries[]): CsvObject[] => {
    const out: CsvObject[] = [];
    const allEntries: Record<string, Record<string, Record<string, number>>> = {};

    parsedFiles.forEach((parsedFile, i) => {
        for (const legendName of Object.keys(parsedFile)) {
            const entries = parsedFile[legendName];
            allEntries[legendName] ||= {};
            for (const entry of entries) {
                allEntries[legendName][entry.fieldValue] ||= {};
                allEntries[legendName][entry.fieldValue][i + ''] = entry.value;
            }
        }
    });

    for (const legendName of Object.keys(allEntries)) {
        const fieldValues = Object.keys(allEntries[legendName]);

        const lines = [legendName];
        for (const fieldValue of fieldValues) {
            const perField = allEntries[legendName][fieldValue];
            const line: string[] = [fieldValue];
            for (let i = 0; i < parsedFiles.length; i++) {
                const stored: number | undefined = perField[i];
                line.push((stored || '') + '');
            }
            lines.push(line.join(',,'));
        }

        const joinedLines = lines.join('\n');
        out.push({legendName, data: joinedLines});
    }

    return out;
}

setTimeout(async () => {
    const allFileData: ParsedEntries[] = [];

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
        allFileData.push(entries);
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
