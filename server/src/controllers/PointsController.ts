import { Request, Response, request } from 'express';
import knex from '../database/connection';

class PointsController {
    async create(req: Request, res: Response) {
        const { name, email, celular, latitude, longitude, city, uf, items } = req.body;

        const trx = await knex.transaction(); // espera a primeira tabela executar com sucesso e a segunda também

        const point = { image: req.file.filename, name, email, celular, latitude, longitude, city, uf }

        const insertedIds = await trx('points').insert(point);

        const point_id = insertedIds[0];

        const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        });

        await trx('point_items').insert(pointItems);

        await trx.commit();

        return res.json({
            id: point_id,
            ...point
        });
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first(); // se não colocar first, volta um array
        if(!point) {
            return res.status(400).json({ message: 'Point not found' });
        }

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.1.107:8000/uploads/${point.image}`
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id);

        return res.json({serializedPoint, items});
    }

    async index(req: Request, res: Response) {
        // filtros = cidade, uf, items (query)
        const { city, uf, items } = req.query;
        console.log(city, uf, items)
        const parsedItems = String(items).split(',')
            .map(item => Number(item.trim())); // trim tira os espaços
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems) // where in = pelo menos um
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.1.107:8000/uploads/${point.image}`
            }
        });
        return res.json(serializedPoints);
    }
}


export default PointsController;