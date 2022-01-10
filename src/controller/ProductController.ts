import express, { Request, Response } from 'express';
import { ListProps } from '../model/ListProps';
import { productService } from '../service/ProductService';

const jwt = require("jsonwebtoken");

class ProductController {

    getProductList = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { page, search, pagesize } = listprops;
        res.json(await productService.getProductListService(page, search, pagesize));
    }

    addProduct = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { page, search, pagesize } = listprops;
        await productService.addProductService(req, res);
        res.json(await productService.getProductListService(page, search, pagesize));
    }

    removeProduct = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { page, search, pagesize } = listprops;
        await productService.removeProductService(req.params.idProduct);
        res.json(await productService.getProductListService(page, search, pagesize));
    }

    updateProduct = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { page, search, pagesize } = listprops;
        await productService.updateProductService(req, res);
        res.json(await productService.getProductListService(page, search, pagesize));
    }

    getProductDetails = async (req: Request, res: Response) => {
        await productService.getProductDetailsService(req, res);
    }

    getListCart = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { userId } = listprops
        res.json(await productService.getListCartService(userId));
    }

    addProductToCart = async (req: Request, res: Response) => {
        await productService.addProductToCartService(req, res);
    }

    setReductionQuantity = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { userId } = listprops
        await productService.setReductionQuantityService(req.params.idCart);
        res.json(await productService.getListCartService(userId));
    }

    setIncreaseQuantity = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { userId } = listprops
        await productService.setIncreaseQuantityService(req.params.idCart);
        res.json(await productService.getListCartService(userId));
    }

    deleteCartItems = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body;
        const { userId } = listprops
        await productService.deleteCartItemsService(req.params.idCart);
        res.json(await productService.getListCartService(userId));
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