import {Query} from '../../types/config_types';
import {GrafanaQueryPayload, GrafanaRequestBody} from '../../types/grafana_types';
import {GRAFANA_DATASOURCE_UID} from './environment';

const daysToMillis = (num: number) => {
    return num * (1000 * 60 * 60 * 24);
}

const utcOffsetSec = -18000;
const maxDataPoints = 1130;
const datasourceUid = GRAFANA_DATASOURCE_UID!;

export const makeBodyFromQueries = (queryNumber: number, daysPerQuery: number, offsetDays: number, queries: Query[], namespace: string): GrafanaRequestBody => {
    const time1 = new Date().getTime() - (daysToMillis((offsetDays + queryNumber * daysPerQuery)));
    const time2 = time1 - daysToMillis(daysPerQuery);

    let intervalMs = daysPerQuery * 60000;
    if (daysPerQuery > 6) {
        intervalMs = Math.floor(daysPerQuery / 7) * 600000;
    }

    const from = time2 + '';;
    const to = time1 + '';

    const queryObjects = queries.map((query): GrafanaQueryPayload => {
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
