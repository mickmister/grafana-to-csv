import {Query} from './types/config_types';
import {GrafanaQueryPayload, GrafanaRequestBody} from './types/grafana_types';

const daysToMillis = (num: number) => {
    return num * (1000 * 60 * 60 * 24);
}

const utcOffsetSec = -18000;
const intervalMs = 120000;
const maxDataPoints = 1130;
const datasourceUid = process.env.GRAFANA_DATASOURCE_UID!;
const datasourceId = parseInt(process.env.GRAFANA_DATASOURCE_ID!);

export const makeBodyFromQueries = (queryNumber: number, daysPerQuery: number, queries: Query[], namespace: string): GrafanaRequestBody => {
    const time1 = new Date().getTime() - (daysToMillis(queryNumber * daysPerQuery));
    const time2 = time1 - daysToMillis(daysPerQuery);

    const from = time2 + '';;
    const to = time1 + '';

    const queryObjects = queries.map((query, i): GrafanaQueryPayload => {
        const refId = query.name;
        const expression = query.expression.replaceAll('$NAMESPACE', namespace);

        return {
            datasource: {
                type: 'prometheus',
                uid: datasourceUid,
            },
            editorMode: 'code',
            expr: expression,
            format: 'table',
            hide: false,
            instant: true,
            interval: '',
            intervalFactor: 1,
            legendFormat: query.name,
            refId: refId,
            exemplar: false,
            requestId: `2${refId}`,
            utcOffsetSec,
            datasourceId,
            intervalMs,
            maxDataPoints,
        };
    });

    return {
        from,
        to,
        queries: queryObjects,
    };
}

export const makeBodyFromExpression = (dayNumber: number, expr: string, refId: string) => {
    const time1 = new Date().getTime() - (daysToMillis(dayNumber));
    const time2 = time1 - daysToMillis(1);

    const from = time2 + '';;
    const to = time1 + '';

    // "from": "1703033191086",
    //   "to": "1703112391086"

    return {
        from,
        to,
        "queries": [
            {
                "datasource": {
                    "type": "prometheus",
                    "uid": "P27C405C01959D762"
                },
                "editorMode": "code",
                "expr": expr,
                "format": "table",
                "hide": false,
                "instant": true,
                "interval": "",
                "intervalFactor": 1,
                "legendFormat": "Reconnect",
                "refId": refId,
                "exemplar": false,
                "requestId": `2${refId}`,
                "utcOffsetSec": -18000,
                "datasourceId": 86,
                "intervalMs": 120000,
                "maxDataPoints": 753
            }
        ],
    };
}
