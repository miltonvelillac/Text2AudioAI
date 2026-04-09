import express, { type Express } from 'express';

import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.routes.js';
import { jobsRouter } from './routes/jobs.routes.js';

const app: Express = express();

app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRouter);
app.use('/api/jobs', jobsRouter);

app.use((_request, response) => {
  response.status(404).json({
    message: 'Route not found.',
  });
});

app.use(errorHandler);

export { app };
