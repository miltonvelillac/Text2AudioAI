import { Router, type Router as ExpressRouter } from 'express';

import {
  createJob,
  getJobStatus,
} from '../controllers/jobs.controller.js';

const jobsRouter: ExpressRouter = Router();

jobsRouter.post('/', createJob);
jobsRouter.get('/:id', getJobStatus);

export { jobsRouter };
