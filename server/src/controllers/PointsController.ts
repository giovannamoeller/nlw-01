import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async create(req: Request, res: Response) {
        const { name, email, celular, latitude, longitude, city, uf, items } = req.body;

        const trx = await knex.transaction(); // espera a primeira tabela executar com sucesso e a segunda também

        const point = { image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60', name, email, celular, latitude, longitude, city, uf }

        const insertedIds = await trx('points').insert(point);

        const point_id = insertedIds[0];

        const pointItems = items.map((item_id: number) => {
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

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id);

        return res.json({point, items});
    }

    async index(req: Request, res: Response) {
        // filtros = cidade, uf, items (query)
        const { city, uf, items } = req.query;
        console.log(city, uf, items)
        const parsedItems = String(items).split(',')
            .map(item => Number(item.trim())); // trim tira os espaços
        console.log(parsedItems)
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems) // where in = pelo menos um
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');
        
        return res.json(points);
    }
}


export default PointsController;