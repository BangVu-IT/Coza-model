import express, { Request, Response } from 'express';
import { ListProps, ProductList } from '../model/ListProps';
import { Product, ProductLine } from '../model/Product';
import { productService } from '../service/ProductService';

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

class ProductController {

    getProductList = async (req: Request, res: Response) => {
        const listProps: ProductList = req.body;
        const { page, inputSearch, rowsPerPage, category, priceValue1, priceValue2, gender, sortPrice } = listProps;
        return res.json(await productService.getProductListService(page, inputSearch, rowsPerPage, category, priceValue1, priceValue2, gender, sortPrice));
    }

    getProductBrandList = async (req: Request, res: Response) => {        
        return res.json(await productService.getProductBrandListService());
    }

    getProductColorList = async (req: Request, res: Response) => {        
        return res.json(await productService.getProductColorListService());
    }

    getProductSizeList = async (req: Request, res: Response) => {        
        return res.json(await productService.getProductSizeListService());
    }

    addProduct = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body.product;
        const { imageProduct, name, brandId, gender } = listprops
        const productId = uuidv4();
        var date = new Date(new Date().getTime());
        let newProduct = {
            id: productId,
            imageProduct: imageProduct,
            name: name,
            brand: brandId,
            gender: gender,
            createdAt: date.toLocaleString('en-GB'),
            updatedAt: date.toLocaleString('en-GB'),
            productItem: {
                productItemId: uuidv4(),
                productId: productId,
                color: req.body.product.productItem.color,
                size: req.body.product.productItem.size,
                image: req.body.product.productItem.image,
                price: req.body.product.productItem.price,
                quantity: req.body.product.productItem.quantity
            }
        }
        
        return res.json(await productService.addProductService(newProduct));
    }

    updateProduct = async (req: Request, res: Response) => {        
        return res.json(await productService.updateProductService(req, res));
    }

    removeProduct = async (req: Request, res: Response) => {
        return res.json(await productService.removeProductService(req, res));
    }

    addProductItem = async (req: Request, res: Response) => {
        const listprops: ListProps = req.body.productItem;
        const { colorId, sizeId, price, quantity, image } = listprops
        let newProduct: Product = {
            productItemId: uuidv4(),
            productId: req.body.productId,
            colorId: colorId,
            color: "",
            sizeId: sizeId,
            size: "",
            image: image,
            price: price,
            quantity: quantity
        }
        
        return res.json(await productService.addProductItemService(newProduct));
    }    

    updateProductItem = async (req: Request, res: Response) => {
        return res.json(await productService.updateProductItemService(req, res));
    }    

    removeProductItem = async (req: Request, res: Response) => {
        return res.json(await productService.removeProductItemService(req.params.idProduct, req.params.idProductItem));
    }

    getProductDetails = async (req: Request, res: Response) => {
        return res.json(await productService.getProductDetailsService(req, res));
    }

}

export const productController = new ProductController();