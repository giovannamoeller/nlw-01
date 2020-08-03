import express from 'express';
import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';
import {celebrate, Joi} from 'celebrate';



import multer from 'multer';
import multerConfig from './config/multer';

const upload = multer(multerConfig);

const items = new ItemsController();
const points = new PointsController();

const routes = express.Router();

routes.get('/items', items.index);

routes.get('/points', points.index);
routes.post('/points', upload.single('image'), 
celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        celular: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        items: Joi.string().required()
    }),
}, {
    abortEarly: false
}),
points.create);
routes.get('/points/:id', points.show);

export default routes;