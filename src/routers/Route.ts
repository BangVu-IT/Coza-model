import express, { Request, response, Response } from 'express';
import { Router } from "express";
import { cartController } from '../controller/CartController';
import { orderController } from '../controller/OrderController';
import { productController } from "../controller/ProductController";
import { userController } from '../controller/UserController';

const router = Router();
const jwt = require("jsonwebtoken");

const verify = (req: Request, res: Response, next: any) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json("Please login to use this function!");
        
    try {        
        jwt.verify(token, process.env.SECRET_TOKEN);
        next()
    } catch (error) {
        return res.status(403).send('Invalid token!')
    }
}

const verifyAdmin = (req: Request, res: Response, next: any) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json("Please login to use this function!");

    try {
        if ((jwt.verify(token, process.env.SECRET_TOKEN)).role != 'admin') {                      
            return res.status(401).send('Can not access!')
        } else {
            jwt.verify(token, process.env.SECRET_TOKEN);
            next()
        }
    } catch (error) {
        return res.status(403).send('Invalid token!')
    }
}

// get product list
router.post('/products', verify, productController.getProductList)
// get product list admin
router.post('/products/admin', verifyAdmin, productController.getProductList)
// add product to warehouse
router.post('/add/', verifyAdmin, productController.addProduct)
// add product item from product
router.post('/add/product-item', verifyAdmin, productController.addProductItem)
// get product brand list
router.get('/brand/list', productController.getProductBrandList)
// add brand product
router.post('/add/brand', productController.addBrandProduct)
// update brand product
router.put('/update/brand', productController.updateBrandProduct)
// delete brand product
router.delete('/delete/brand/:id', productController.deleteBrandProduct)
// get product color list
router.get('/color/list', productController.getProductColorList)
// get product color list
router.get('/size/list', productController.getProductSizeList)
// update product from warehouse
router.put('/update/:idProduct', verifyAdmin, productController.updateProduct)
// update product item from warehouse
router.put('/update/product-item/:idProductItem', verifyAdmin, productController.updateProductItem)
// remove product from warehouse
router.delete('/delete/:idProduct', verifyAdmin, productController.removeProduct)
// remove product item from warehouse
router.delete('/delete/product-item/:idProduct/:idProductItem', verifyAdmin, productController.removeProductItem)
// get product details
router.get('/product/:idProduct', verify, productController.getProductDetails)


// get cart list
router.post('/checkout/cart', verify, cartController.getListCart)
// add product to cart
router.post('/add/product/cart', verify, cartController.addProductToCart)
// reduce the number of products from the cart
router.get('/cart/reduction/:cartId', verify, cartController.setReductionQuantity)
// increase the number of products from the cart
router.get('/cart/increase/:cartId/:idProductItem', verify, cartController.setIncreaseQuantity)
// remove product from cart
router.delete('/delete/cart/:cartId', verify, cartController.deleteCartItems)


// receive order information
router.post('/checkout/delivery', verify, orderController.setOrderInformation)
// get order list
router.post('/order-list', verifyAdmin, orderController.getListOrderManage)
// get list of user orders
router.post('/orders', verify, orderController.getListOrder)
// update order status
router.post('/order/update', verifyAdmin, orderController.updateOrderStatus)

// get user list
router.get('/users/list', userController.getListUser)
// add user
router.post('/add/user', userController.addUser)
// update user
router.put('/user/update', userController.updateUser)
// add user
router.delete('/delete/user/:id', userController.deleteUser)
// user login
router.post('/users/login', userController.userLogin)
// register
router.post('/users/register', userController.register)
// get user info
router.get('/get-me', userController.getMe)

export default router;