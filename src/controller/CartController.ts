import express, { Request, Response } from 'express';
import { ListProps } from '../model/ListProps';
import { OrderProduct } from '../model/OrderProduct';
import { cartService } from '../service/CartService';
import { userService } from '../service/UserService';

const { v4: uuidv4 } = require('uuid');

class CartController {

    getListCart = async (req: Request, res: Response) => {
        return res.json(await cartService.getListCartService(req.body.userId));
    }

    addProductToCart = async (req: Request, res: Response) => {        
        const listProps: OrderProduct = req.body.cartProduct;
        const { orderId, idProductItem, image, name, colorId, sizeId, price, quantity } = listProps
        let newCartProduct: OrderProduct = {
            cartId: uuidv4(),
            orderId: orderId,
            idProductItem: idProductItem,
            image: image,
            name: name,
            colorId: colorId,
            sizeId: sizeId,
            price: price,
            quantity: quantity
        }
        return res.json(await cartService.addProductToCartService(newCartProduct));
    }

    setReductionQuantity = async (req: Request, res: Response) => {     
        return res.json(await cartService.setReductionQuantityService(req.params.cartId));
    }

    setIncreaseQuantity = async (req: Request, res: Response) => {       
        return res.json(await cartService.setIncreaseQuantityService(req.params.cartId, req.params.idProductItem));
    }

    deleteCartItems = async (req: Request, res: Response) => {       
        return res.json(await cartService.deleteCartItemsService(req.params.cartId));
    }

}

export const cartController = new CartController();