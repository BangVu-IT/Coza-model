import express, { Request, response, Response } from 'express';
import { Router } from "express";
import { productController } from "../controller/ProductController";

const router = Router();
const jwt = require("jsonwebtoken");

const verify = (req: Request, res: Response, next: any) => {    
    const token = req.header('Authorization');    
    if (!token) return res.status(403).json("Vui lòng đăng nhập để sử dụng chức năng này!");
    try {        
        jwt.verify(token, process.env.SECRET_TOKEN);        
        next()
    } catch (error) {
        res.status(401).send('Token không hợp lệ')
    }
}

// get product list
router.post('/products', productController.getProductList)

// add product to warehouse
router.post('/add/', productController.addProduct)

// remove product from warehouse
router.delete('/delete/:idProduct', productController.removeProduct)

// update product from warehouse
router.put('/update/:idProduct', productController.updateProduct)

// get product details
router.get('/product/:idProduct', productController.getProductDetails)

// get cart list
router.get('/checkout/cart', productController.getListCart)

// add product to cart
router.post('/carts/:idProduct', productController.addProductToCart)

// reduce the number of products from the cart
router.get('/cart/reduction/:idCart', productController.setReductionQuantity)

// increase the number of products from the cart
router.get('/cart/increase/:idCart', productController.setIncreaseQuantity)

// remove product from cart
router.delete('/cart/item/:idCart', productController.deleteCartItems)

// receive order information
router.post('/checkout/delivery', productController.setOrderInformation)

// get order list
router.post('/orders', verify, productController.getListOrder)

// user login
router.post('/users/login', productController.userLogin)

router.get('/get-me', productController.getMe)

export default router;