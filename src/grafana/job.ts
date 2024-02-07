import fs from 'fs/promises';

import {Config} from '../../types/config_types';
import {GrafanaResponseBody} from '../../types/grafana_types';
import {doRequest} from './requests';

export const runJobFetchData = async (config: Config) => {
    let configuredQueries = config.queries;
    if (config.runQueries.length) {
        configuredQueries = config.runQueries.map((index) => config.queries[index]).filter(Boolean);
    }

    const numRequests = config.totalNumberOfRequests;

    const iso = new Date().toISOString();
    const outPrefix = config.jsonFolderName;

    const directory = `./data/${outPrefix}/${iso}`;
    await fs.mkdir(directory, {recursive: true});

    const totalDays = numRequests * config.numberOfDaysPerRequest;

    console.log('Using queries:\n');
    console.log(JSON.stringify(configuredQueries, null, 2));

    console.log(`\nFetching ${totalDays} days worth of Prometheus data. ${numRequests} requests each ${config.numberOfDaysPerRequest} days, with ${configuredQueries.length} queries in each request.`);

    for (let queryNumber = numRequests - 1; queryNumber > -1; queryNumber--) {
        console.log('');
        console.log(`Request ${numRequests - queryNumber} of ${numRequests}`);

        let res: GrafanaResponseBody;
        try {
            res = await doRequest(queryNumber);
        } catch (e) {
            console.error(`Error performing request ${e}`);
            return;
        }

        if ('message' in res) {
            console.log(`Response from Grafana: ${res.message}`);
            return;
        }

        for (const legendName of Object.keys(res.results)) {
            const error = res.results[legendName].error;
            if (error) {
                console.log(JSON.stringify(res.results[legendName], null, 2), `\n\nReceived error from Grafana for "${legendName}". Look above this line to see the error.\n`);
                delete res.results[legendName];
            }
        }

        const [startDateStr, endDateStr] = getDateRangeFromQueryNumber(config.numberOfDaysPerRequest, config.offsetDays, queryNumber);
        const fname = `${directory}/${outPrefix}-${startDateStr}_${endDateStr}.json`;

        // const fname = `${directory}/${outPrefix}-${queryNumber}.json`;
        await fs.writeFile(fname, JSON.stringify(res, null, 2));
        const message = `Wrote ${fname}`;
        console.log(message);
        // notify(message);

        if (queryNumber === 0) {
            return;
        }

        const secondsToWait = 5;
        console.log(`Waiting ${secondsToWait} seconds before next request`);
        await new Promise(r => setTimeout(r, 1000 * secondsToWait));
    }
};

const getDateRangeFromQueryNumber = (numberOfDaysPerQuery: number, offsetDays: number, queryNumber: number): [string, string] => {
    const now = new Date().getTime();
    const millisInDay = 1000 * 60 * 60 * 24;

    const start = now - (millisInDay * (offsetDays + numberOfDaysPerQuery * (queryNumber + 1)));
    const end = now - (millisInDay * (offsetDays + numberOfDaysPerQuery * queryNumber));

    const startDateStr = new Date(start).toISOString().substring(0, 10);
    const endDateStr = new Date(end).toISOString().substring(0, 10);
    return [startDateStr, endDateStr];
}
