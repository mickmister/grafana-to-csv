require('dotenv').config();

import {runJobCreateCsv} from './csv_creator';

setTimeout(async () => {
    await runJobCreateCsv();
});
