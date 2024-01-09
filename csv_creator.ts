import fs from 'fs/promises';

const fnames = [
    '09_01-09_14.json',
    '09_15-09_28.json',
    '09_29-10_12.json',
    '10_13-10_26.json',
    '10_27.json',
    '11_10.json',
    '11_24.json',
    'now-14d.json',
];

import originalFileData from './data/multi/two weeks/now-14d.json';
const date = 'now-14d';

type Entry = {
    handler: string;
    value: number;
}

const parseIntoEntries = (fdata: typeof originalFileData): Entry[] => {
    return fdata.results.Count.frames.map(frame => {
        const handler = (frame.schema.fields[1].labels as {handler: string}).handler;
        const value = frame.data.values[1][0];
        return {
            handler,
            value,
        };
    });
}

const averageEntries = originalFileData.results.Average.frames.map(frame => {
    const handler = (frame.schema.fields[1].labels as {handler: string}).handler;
    const value = frame.data.values[1][0];
    return {
        handler,
        value,
    };
});

const totalTimeEntries = originalFileData.results['Total Time'].frames.map(frame => {
    const handler = (frame.schema.fields[1].labels as {handler: string}).handler;
    const value = frame.data.values[1][0];
    return {
        handler,
        value,
    };
});

const countEntries = originalFileData.results.Count.frames.map(frame => {
    const handler = (frame.schema.fields[1].labels as {handler: string}).handler;
    const value = frame.data.values[1][0];
    return {
        handler,
        value,
    };
});

const formatCsv = (parsedFiles: Entry[][]) => {
    const handlerData: Record<string, Record<string, number>> = {};

    parsedFiles.forEach((parsedFile, i) => {
        for (const entry of parsedFile) {
            handlerData[entry.handler] ||= {};
            handlerData[entry.handler][i + ''] = entry.value;
        }
    });

    const lines = ['Handler,Value'];
    for (const handlerName of Object.keys(handlerData)) {
        const perHandler = handlerData[handlerName];
        const line: string[] = [handlerName];
        for (let i = 0; i < parsedFiles.length; i++) {
            const stored: number | undefined = perHandler[i];
            line.push((stored || '') + '');
        }

        lines.push(line.join(',,'));
    }

    const out = lines.join('\n');

    return out;
}

setTimeout(async () => {
    const allFileData: Entry[][] = [];

    for (const fname of fnames) {
        const fpath = `./data/multi/two weeks/${fname}`;
        const rawFileData = (await fs.readFile(fpath)).toString();
        const fileData = JSON.parse(rawFileData) as typeof originalFileData;
        const entries = parseIntoEntries(fileData);
        allFileData.push(entries);
    }

    const avgCsv = formatCsv(allFileData);
    await fs.writeFile(`./data/csv/all-count.csv`, avgCsv);
});
