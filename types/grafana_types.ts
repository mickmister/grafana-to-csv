export type GrafanaQueryPayload = {
    datasource: {
        type: string;
        uid: string;
    };
    editorMode: string;
    expr: string;
    format: string;
    hide: false;
    instant: true;
    interval: string;
    intervalFactor: 1;
    legendFormat: string;
    refId: string;
    exemplar: boolean;
    requestId: string;
    utcOffsetSec: number;
    intervalMs: number;
    maxDataPoints: number;
}

export type GrafanaRequestBody = {
    from: string;
    to: string;
    queries: GrafanaQueryPayload[];
}

export type GrafanaResponseBody = {
    results: Results;
}
type Results = {
    [legendName: string]: {
        error?: string;
        status: number;
        frames: FramesItem[];
    };
}

type FramesItem = {
    schema: Schema;
    data: Data;
}
type Schema = {
    refId: string;
    meta: Meta;
    fields: FieldsItem[];
}
type Meta = {
    type: string;
    typeVersion: number[];
    custom: Custom;
    executedQueryString?: string;
}
type Custom = {
    resultType: string;
}
type FieldsItem = {
    name: string;
    type: string;
    typeInfo: TypeInfo;
    config: Config;
    labels?: Labels;
}
type TypeInfo = {
    frame: string;
}
type Config = {
    interval?: number;
    displayNameFromDS?: string;
}
export type Labels = {
    [fieldName: string]: string;
}
type Data = {
    values: any[];
}
