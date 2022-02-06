import express, { Request, Response } from 'express';
import { pool } from '../connect-db/Client';
import { ListProps } from '../model/ListProps';
import { OrderProduct } from '../model/OrderProduct';

const { v4: uuidv4 } = require('uuid');

class CartService {

    getListCartService = async (userId: string) => {
        let cartProduct;
        var date = new Date(new Date().getTime());
        const checkEmpty = await pool.query(`select order_id from "order" where user_id = '${userId}' and is_temporary = false`);

        if (checkEmpty.rows[0] !== undefined) {
            cartProduct = await pool.query(`select order_product.cart_id, order_product.order_id, product.product_item_id, product.image, product_line."name",
            product_color.color, product_size."size", order_product.quantity, product.price
            from order_product join "order" on order_product.order_id = "order".order_id join
            product on order_product.product_item_id = product.product_item_id join
            product_color on product.color_id = product_color.color_id join product_size on
            product.size_id = product_size.size_id join product_line on
            product.product_id = product_line.product_id
            where "order".user_id = '${userId}' and "order".is_temporary = false
            order by order_product.cart_id`);
        } else {
            await pool.query(`INSERT INTO public."order" (order_id, user_id, "created_At", is_temporary, full_name, phone_number, email, address, post_code, order_status)
            VALUES('${uuidv4()}', '${userId}', '${date.toLocaleString('en-GB')}', false, '', '', '', '', '', '')`);
        }

        const orderIdUser = await pool.query(`select order_id from "order" where user_id = '${userId}' and is_temporary = false`);
        const cartProducts = cartProduct?.rows;
        const orderId = orderIdUser?.rows[0];
        
        return { cartProducts, orderId };
    }

    addProductToCartService = async (newCartProduct: OrderProduct) => {
        await pool.query(`Do
        $$
        begin
            if exists(select * from order_product join "order" on "order".order_id = order_product.order_id
            where order_product.product_item_id = '${newCartProduct.idProductItem}'
            and "order".order_id = '${newCartProduct.orderId}') then
                UPDATE public.order_product
                SET quantity=quantity + ${newCartProduct.quantity}
                WHERE order_product.order_id ='${newCartProduct.orderId}' and order_product.product_item_id = '${newCartProduct.idProductItem}';
            else
                INSERT INTO public.order_product
                (cart_id, order_id, product_item_id, color_id, size_id, quantity, price)
                VALUES('${newCartProduct.cartId}', '${newCartProduct.orderId}', '${newCartProduct.idProductItem}', '${newCartProduct.colorId}', '${newCartProduct.sizeId}', ${newCartProduct.quantity}, ${newCartProduct.price});
            end if;
        end;
        $$`);
    }

    setReductionQuantityService = async (cartId: string) => {
        await pool.query(`Do
        $$
        begin  	
            if (select order_product.quantity from order_product where cart_id = '${cartId}') <= 1 then
                UPDATE public.order_product SET quantity=1 WHERE cart_id='${cartId}';
            else
                UPDATE public.order_product SET quantity = quantity - 1
                WHERE cart_id='${cartId}';
            end if;
        end;
        $$`);
    }

    setIncreaseQuantityService = async (cartId: string, idProductItem: string) => {
        const productQuantity = await pool.query(`select product.quantity from product where product_item_id = '${idProductItem}'`)

        await pool.query(`Do
        $$
        begin
            if (select order_product.quantity from order_product where cart_id = '${cartId}') >=
            (select product.quantity from product where product_item_id = '${idProductItem}') then
                UPDATE public.order_product SET quantity=${productQuantity.rows[0].quantity} WHERE cart_id='${cartId}';
            else
                UPDATE public.order_product SET quantity = quantity + 1
                WHERE cart_id='${cartId}';
            end if;
        end;
        $$`);
    }

    deleteCartItemsService = async (cartId: string) => {
        await pool.query(`DELETE FROM public.order_product WHERE cart_id='${cartId}'`);
    }

}

export const cartService = new CartService();