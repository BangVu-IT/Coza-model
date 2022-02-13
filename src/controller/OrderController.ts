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

    getListOrderManage = async (req: Request, res: Response) => {
        const listProps: ListProps = req.body;
        const { page, rowsPerPage } = listProps;
        return res.json(await orderService.getListOrderManageService(page, rowsPerPage));
    }

    updateOrderStatus = async (req: Request, res: Response) => {
        const listProps: ListProps = req.body;
        const { orderId, orderStatus } = listProps;
        return res.json(await orderService.updateOrderStatusService(orderId, orderStatus));
    }

}

export const orderController = new OrderController();