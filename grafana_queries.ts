const daysToMillis = (num: number) => {
    return num * (1000 * 60 * 60 * 24);
}

export const makeReconnectAPIHandlerBody = (dayNumber: number) => {
    const expr = 'sum(increase(mattermost_api_time_count{page_load_context=~"reconnect"}[$__range])) by (handler)';
    return makeBody(dayNumber, expr, 'D');
}

export const makeReconnectAvgBody = (dayNumber: number) => {
    const expr = `(1000 * sum(increase(mattermost_api_time_sum{namespace="${namespace}",page_load_context=~"reconnect"}[$__range])) by (handler) / sum(increase(mattermost_api_time_count{namespace="${namespace}",page_load_context=~"reconnect"}[$__range]) > 0) by (handler))`;
    return makeBody(dayNumber, expr, 'A');
}

const makeReconnectCallCountBody = (dayNumber: number) => {
    const expr = `sum(increase(mattermost_api_time_count{namespace="${namespace}",page_load_context=~"reconnect"}[$__range]) > 0) by (handler)`;
    return makeBody(dayNumber, expr, 'A');
}

const makeReconnectTotalTimeBody = (dayNumber: number) => {
    const expr = `sum(increase(mattermost_api_time_sum{namespace="${namespace}",page_load_context=~"reconnect"}[$__range])) by (handler)`;
    return makeBody(dayNumber, expr, 'A');
}

const namespace = 'rxocmq9isjfm3dgyf4ujgnfz3c';

const makeBody = (dayNumber: number, expr: string, refId: string) => {
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
