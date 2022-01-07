import express, { Request, Response } from 'express';
import { ListProps } from '../model/ListProps';
import { productService } from '../service/ProductService';

const jwt = require("jsonwebtoken");

class ProductController {

    getProductList = async (req: Request, res: Response) => {
        await productService.getProductListService(req, res);
    }

    addProduct = async (req: Request, res: Response) => {
        await productService.addProductService(req, res);
        res.json(await productService.getProductListService(req, res));
    }

    removeProduct = async (req: Request, res: Response) => {
        await productService.removeProductService(req, res);
    }

    updateProduct = async (req: Request, res: Response) => {
        await productService.updateProductService(req, res);
        res.json(await productService.getProductListService(req, res));
    }

    getProductDetails = async (req: Request, res: Response) => {
        await productService.getProductDetailsService(req, res);
    }

    getListCart = async (req: Request, res: Response) => {
        res.json(await productService.getListCartService());
    }

    addProductToCart = async (req: Request, res: Response) => {
        await productService.addProductToCartService(req, res);
    }

    setReductionQuantity = async (req: Request, res: Response) => {
        await productService.setReductionQuantityService(req.params.idCart);
        res.json(await productService.getListCartService());
    }

    setIncreaseQuantity = async (req: Request, res: Response) => {
        await productService.setIncreaseQuantityService(req.params.idCart);
        res.json(await productService.getListCartService());
    }

    deleteCartItems = async (req: Request, res: Response) => {
        await productService.deleteCartItemsService(req.params.idCart);
        res.json(await productService.getListCartService());
    }

    setOrderInformation = async (req: Request, res: Response) => {
        await productService.setOrderInformationService(req, res);
    }

    getListOrder = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { page, pagesize } = listprops
        res.json(await productService.getListOrderService(page, pagesize));
    }

    userLogin = async (req: Request, res: Response) => {
        await productService.userLoginService(req, res);
    }

    getMe = async (req: Request, res: Response) => {
        const token = req.header('Authorization');
        if (!token) return res.status(401).json();
        try {
            const id = jwt.verify(token, process.env.SECRET_TOKEN);
            res.json(await productService.getMeService(id.user_id));
        } catch (error) {
            
        }
    }

}

export const productController = new ProductController();