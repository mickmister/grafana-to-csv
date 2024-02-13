import {makeBodyFromQueries} from './grafana_queries';
import {GrafanaResponseBody} from '../../types/grafana_types';
import {GRAFANA_COOKIE, GRAFANA_DATASOURCE_UID, GRAFANA_NAMESPACE} from './environment';

import {Config} from '../../types/config_types';

import configFile from '../../config.json';

const config: Config = configFile;

const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-datasource-uid": GRAFANA_DATASOURCE_UID,
    "x-grafana-org-id": "1",
    "x-panel-id": "2",
    "x-plugin-id": "prometheus"
};

let incrementingRequestId = 100;
let configuredQueries = config.queries;
if (config.runQueries.length) {
    configuredQueries = config.runQueries.map((index) => config.queries[index]).filter(Boolean);
}

const makeBody = (requestNumber: number) => {
    return makeBodyFromQueries(requestNumber, config.numberOfDaysPerRequest, config.offsetDays, configuredQueries, GRAFANA_NAMESPACE);
}

export const doRequest = async (requestNumber: number): Promise<GrafanaResponseBody> => {
    incrementingRequestId++;
    const requestId = `Q${incrementingRequestId}`;

    const body = makeBody(requestNumber);
    console.log('from', new Date(parseInt(body.from)).toISOString());
    console.log('to', new Date(parseInt(body.to)).toISOString());

    const u = `https://grafana.internal.mattermost.com/api/ds/query?ds_type=prometheus&requestId=${requestId}`;
    const time1 = new Date();
    const data = await fetch(u, {
        method: 'POST',
        headers: {
            ...headers,
            cookie: GRAFANA_COOKIE,
        },
        body: JSON.stringify(body),
    }).then(r => r.json());

    const time2 = new Date();
    const ms = time2.getTime() - time1.getTime();
    console.log(`${ms}ms`);

    return data;
}
