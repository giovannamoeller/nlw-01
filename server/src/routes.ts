import express from 'express';
import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';

const items = new ItemsController();
const points = new PointsController();

const routes = express.Router();

routes.get('/items', items.index);

routes.get('/points', points.index);
routes.post('/points', points.create);
routes.get('/points/:id', points.show);

export default routes;