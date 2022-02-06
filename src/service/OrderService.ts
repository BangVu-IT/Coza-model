import express, { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { pool } from '../connect-db/Client';
import { UserOrderInfo } from '../model/ListProps';
import { OrderWithDetail } from '../model/Order';

class OrderService {

    setOrderInformationService = async (userOrderInfo: UserOrderInfo) => {
        let date = new Date(new Date().getTime());
        await pool.query(`UPDATE public."order"
        SET "created_At"='${date.toLocaleString('en-GB')}', is_temporary=true, full_name='${userOrderInfo.fullName}', phone_number='${userOrderInfo.phoneNumber}',
        email='${userOrderInfo.email}', address='${userOrderInfo.address}', post_code='${userOrderInfo.postCode}', order_status='${userOrderInfo.orderStatus}'
        WHERE order_id='${userOrderInfo.orderId}'`);
    }

    getListOrderService = async (userId: string, page: number, rowsPerPage: number) => {
        const cartProduct: QueryResult = await pool.query(`select o.order_id, o.user_id, o."created_At", o.is_temporary, o.full_name,
        o.phone_number, o.email, o.address, o.post_code, o.order_status, op.cart_id,
        op.product_item_id, op.quantity, op.price, p.image, pc.color, ps."size", pl."name"
        from "order" o join order_product op on o.order_id = op.order_id join 
        product p on op.product_item_id = p.product_item_id join product_color pc on p.color_id = pc.color_id 
        join product_size ps on p.size_id = ps.size_id join product_line pl on p.product_id = pl.product_id 
        where o.order_id in (select order_id from "order" o2 where o2.user_id = '${userId}' and o2.is_temporary = true 
        group by o2.order_id limit ${rowsPerPage} offset (${page} * ${rowsPerPage}) - ${rowsPerPage})`);

        const pageNumberOrder = await pool.query(`select "order".order_id from "order" where "order".user_id = '${userId}' and "order".is_temporary = true group by order_id`);
        
        const listOrdersProduct = cartProduct.rows;
        
        const pageNumber = pageNumberOrder.rows.length;
        let listOrders: OrderWithDetail[] = [];
        let idOrder: string[] = [];
        let pageNumbers = [];

        listOrdersProduct.map(item => idOrder.push(item.order_id));

        idOrder = Array.from(new Set(idOrder));

        idOrder.map(order_id => {
            const order: OrderWithDetail = {
                orderId: order_id,
                userId: userId,
                createdAt: "",
                isTemporary: false,
                fullName: "",
                phoneNumber: "",
                email: "",
                address: "",
                postCode: "",
                orderStatus: "",
                orderProducts: [],
            }

            listOrdersProduct.map(orderItem => {
                if (orderItem.order_id == order_id) {
                    order.createdAt = orderItem.created_At,
                        order.isTemporary = orderItem.is_temporary,
                        order.fullName = orderItem.full_name,
                        order.phoneNumber = orderItem.phone_number,
                        order.email = orderItem.email,
                        order.address = orderItem.address,
                        order.postCode = orderItem.post_code,
                        order.orderStatus = orderItem.order_status,
                        order.orderProducts.push({
                            cartId: orderItem.cart_id,
                            orderId: orderItem.order_id,
                            idProductItem: orderItem.product_item_id,
                            image: orderItem.image,
                            name: orderItem.name,
                            colorId: orderItem.color_id,
                            sizeId: orderItem.size_id,
                            quantity: orderItem.quantity,
                            price: orderItem.price,
                            product: {
                                productItemId: orderItem.product_item_id,
                                productId: orderItem.product_id,
                                image: orderItem.image,
                                colorId: orderItem.color_id,
                                color: orderItem.color,
                                sizeId: orderItem.size_id,
                                size: orderItem.size,
                                price: orderItem.price,
                                quantity: orderItem.quantity
                            }
                        });
                }
            });
            listOrders.push(order)
        })

        let count = 0;

        for (let i = 0; i < pageNumber; i++) {
            if ((i + 1) % rowsPerPage == 0) {
                count += 1;
                pageNumbers.push(count)
            }
        }
        if (pageNumber % rowsPerPage != 0) {
            count += 1;
            pageNumbers.push(count)
        }

        return { listOrders, pageNumbers };
    }

}

export const orderService = new OrderService();