import { Router, type Router as ExpressRouter } from 'express';

import { getHealth } from '../controllers/health.controller.js';

const healthRouter: ExpressRouter = Router();

healthRouter.get('/', getHealth);

export { healthRouter };
