import express, { Request, Response } from 'express';
import { OrderProductCart } from '../model/ListProps';
import { OrderProduct } from '../model/OrderProduct';
import { cartService } from '../service/CartService';

const { v4: uuidv4 } = require('uuid');

class CartController {

    getListCart = async (req: Request, res: Response) => {
        return res.json(await cartService.getListCartService(req.body.userId));
    }

    addProductToCart = async (req: Request, res: Response) => {        
        const listProps: OrderProductCart = req.body.cartProduct;
        const { orderId, idProductItem, image, name, brand, gender, colorId, sizeId, price, quantity } = listProps
        let newCartProduct: OrderProduct = {
            cartId: uuidv4(),
            orderId: orderId,
            idProductItem: idProductItem,
            image: image,
            name: name,
            brand: brand,
            gender: gender,
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