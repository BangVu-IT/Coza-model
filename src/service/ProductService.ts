import express, { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { pool } from "../connect-db/Client";
import { ListProps } from "../model/ListProps";
import { OrderWithDetail } from '../model/Order';
import { Product } from "../model/Product";
import { User } from '../model/User';

const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");

class ProductService {    

    getProductListService = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { page, search, pagesize } = listprops;
        let products, pageNumber;
        if (search) {
            products = await pool.query(`SELECT * FROM product WHERE name ILIKE '${search}%' limit ${pagesize} offset (${page} * ${pagesize}) - ${pagesize}`);
            pageNumber = await pool.query(`Select count(*) from public.product where name ILIKE '${search}%'`);
        } else {
            products = await pool.query(`Select * from public.product LIMIT ${pagesize}
            OFFSET (${page} * ${pagesize}) - ${pagesize}`);
            pageNumber = await pool.query("Select count(*) from public.product");
        }

        let arrProduct = products.rows;
        let arrPageNumber = [];
        const totalPageNumber = Number(pageNumber.rows[0].count);
        let count = 0;

        for (let i = 0; i < totalPageNumber; i++) {
            if ((i + 1) % pagesize == 0) {
                count += 1;
                arrPageNumber.push(count)
            }
        }
        if (totalPageNumber % pagesize != 0) {
            count += 1;
            arrPageNumber.push(count)
        }

        res.json({ arrProduct, arrPageNumber });
    }

    addProductService = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body.product;
        const { image, name, brand, price } = listprops
        let newProduct = {
            id: uuidv4(),
            image: image,
            name: name,
            brand: brand,
            price: price
        }
        await pool.query(`INSERT INTO public.product (id, image, name, brand, price)
        VALUES('${newProduct.id}', '${newProduct.image}', '${newProduct.name}', '${newProduct.brand}', ${newProduct.price})`);
    }

    removeProductService = async (req: Request, res: Response) => {
        await pool.query(`DELETE FROM public.product WHERE id = '${req.params.idProduct}'`);
    }

    updateProductService = async (req: Request, res: Response) => {
        let id = req.params.idProduct;
        const listprops: ListProps = req.body.product;
        const { image, name, brand, price } = listprops;
        await pool.query(`UPDATE public.product
        SET image='${image}', "name"='${name}', brand='${brand}', price=${price}
        WHERE id='${id}'`);
    }

    getProductDetailsService = async (req: Request, res: Response) => {
        let idProduct = req.params.idProduct;
        const product = await pool.query(`select * from product where id = '${idProduct}'`);
        res.json(product.rows[0]);
    }

    getListCartService = async () => {
        const cartProduct = await pool.query(`select order_product.order_id, order_product.cart_id, product.image, product."name",
        product.brand, product.price, order_product.quantity
        from order_product join 
        product on order_product.id = product.id join
        "order" on order_product.order_id = "order".order_id where "order".user_id = '1' and "order".istemporary = false
        order by order_product.cart_id`);
        return cartProduct.rows;
    }

    addProductToCartService = async (req: Request, res: Response) => {
        const checkEmpty = await pool.query(`select order_id from "order" where user_id = '1' and istemporary = false`);
        if (checkEmpty.rows[0] !== undefined) {
            await pool.query(`Do
            $$
            begin
                if exists(select * from order_product join "order" on "order".order_id = order_product.order_id
                where id = '${req.params.idProduct}' and "order".istemporary = false) then
                    UPDATE public.order_product
                    SET quantity = quantity + ${req.body.quantity} where id = '${req.params.idProduct}' and order_id = '${checkEmpty.rows[0].order_id}';
                else
                    INSERT INTO public.order_product (cart_id, order_id, id, quantity, price)
                    VALUES('${uuidv4()}' ,'${checkEmpty.rows[0].order_id}', '${req.params.idProduct}', ${req.body.quantity}, ${req.body.price});
                end if;
            end;
            $$`);
        } else {
            let idOrder = uuidv4();
            await pool.query(`INSERT INTO public."order" (order_id, user_id, createat, istemporary)
            VALUES('${idOrder}', '1', '${new Date()}', false);`);
            await pool.query(`INSERT INTO public.order_product (cart_id, order_id, id, quantity, price)
            VALUES('${uuidv4()}' ,'${idOrder}', '${req.params.idProduct}', ${req.body.quantity}, ${req.body.price})`);
        }

        return res.json([]);
    }

    setReductionQuantityService = async (id: string) => {
        await pool.query(`Do
        $$
        begin  	
            if (select order_product.quantity from order_product where cart_id = '${id}') <= 1 then
                UPDATE public.order_product SET quantity = 1
                WHERE cart_id='${id}';
            else
                UPDATE public.order_product SET quantity = quantity - 1
                WHERE cart_id='${id}';
            end if;
        end;
        $$`);
    }

    setIncreaseQuantityService = async (id: string) => {
        await pool.query(`UPDATE public.order_product
        SET quantity=quantity + 1
        WHERE cart_id = '${id}'`);
    }

    deleteCartItemsService = async (id: string) => {
        await pool.query(`DELETE FROM public.order_product
        WHERE cart_id='${id}'`);
    }

    setOrderInformationService = async (req: Request, res: Response) => {
        let userInformation: User = req.body.dataOrder;
        await pool.query(`UPDATE public."user"
        SET fullname='${userInformation.fullName}', phonenumber='${userInformation.phoneNumber}', email='${userInformation.email}', address='${userInformation.address}', postcode='${userInformation.postcode}'
        WHERE user_id='1';`);
        await pool.query(`UPDATE public."order"
        SET istemporary=true WHERE order_id='${req.body.idOrder}'`);
    }

    getListOrderService = async (page: number, pageSize: number) => {
        const cartProduct: QueryResult = await pool.query(`select * from "user" join "order" on "user".user_id = "order".user_id join
        order_product on order_product.order_id = "order".order_id join 
        product on order_product.id = product.id
        where "order".order_id in
        (select order_id from "order" where
        "order".user_id = '1' and "order".istemporary = true group by "order".order_id limit ${pageSize} offset (${page} * ${pageSize}) - ${pageSize})`);
        const pageNumberOrder = await pool.query(`select "order".order_id from "order" where "order".user_id = '1' and "order".istemporary = true group by order_id`);

        const listOrdersProduct = cartProduct.rows;
        const pageNumber = pageNumberOrder.rows.length
        let listOrders: OrderWithDetail[] = [];
        let idOrder: string[] = [];
        let pageNumbers = [];

        listOrdersProduct.map(item => idOrder.push(item.order_id));

        idOrder = Array.from(new Set(idOrder));

        idOrder.map(order_id => {
            const order: OrderWithDetail = {
                id: order_id,
                userId: "1",
                createdAt: "",
                isTemporary: false,
                orderProducts: [],
                user: {
                    id: "",
                    fullName: "",
                    phoneNumber: 113,
                    email: "",
                    address: "",
                    postcode: "",
                }
            }

            listOrdersProduct.map(orderItem => {
                if (orderItem.order_id == order_id) {
                    order.createdAt = orderItem.createat,
                        order.isTemporary = orderItem.istemporary,
                        order.orderProducts.push({
                            id: orderItem.cart_id,
                            orderId: orderItem.order_id,
                            idProduct: orderItem.id,
                            quantity: orderItem.quantity,
                            price: orderItem.price,
                            product: {
                                id: orderItem.id,
                                image: orderItem.image,
                                name: orderItem.name,
                                brand: orderItem.brand,
                                price: orderItem.price
                            }
                        });
                    order.user = {
                        id: orderItem.user_id,
                        fullName: orderItem.fullname,
                        phoneNumber: orderItem.phonenumber,
                        email: orderItem.email,
                        address: orderItem.address,
                        postcode: orderItem.postcode,
                    }
                }
            });
            listOrders.push(order)
        })

        let count = 0;

        for (let i = 0; i < pageNumber; i++) {
            if ((i + 1) % pageSize == 0) {
                count += 1;
                pageNumbers.push(count)
            }
        }
        if (pageNumber % pageSize != 0) {
            count += 1;
            pageNumbers.push(count)
        }

        return { listOrders, pageNumbers };
    }

    getMeService = async (userId: string) => {
        const userInfo = await pool.query(`select * from "user" where user_id = '${userId}'`);
        return userInfo.rows[0];
    }

    userLoginService = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { userName, passWord } = listprops        
        const checkAccount = await pool.query(`select user_id from "user" where "userName" = '${userName}' and "passWord" = '${passWord}'`);

        if (checkAccount.rows[0] !== undefined) {
            const token = jwt.sign(checkAccount.rows[0], process.env.SECRET_TOKEN, { expiresIn: '30s' });        
            res.header("Authorization", token).send(token);
        } else {
            res.status(401).send();
        }
    }

}

export const productService = new ProductService();