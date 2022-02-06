import express, { Request, Response } from 'express';
import { ListProps, UserOrderInfo } from '../model/ListProps';
import { orderService } from '../service/OrderService';

class OrderController {

    setOrderInformation = async (req: Request, res: Response) => {
        const userOrderInfo: UserOrderInfo = req.body.dataOrder;
        return res.json(await orderService.setOrderInformationService(userOrderInfo));
    }

    getListOrder = async (req: Request, res: Response) => {
        const listProps: ListProps = req.body;
        const { userId, page, rowsPerPage } = listProps;
        return res.json(await orderService.getListOrderService(userId, page, rowsPerPage));
    }

}

export const orderController = new OrderController();