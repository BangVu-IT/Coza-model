import express, { Request, Response } from 'express';
import { ListProps, ProductLineBody, ProductList } from '../model/ListProps';
import { Brand, Product, ProductLine } from '../model/Product';
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

    addBrandProduct = async (req: Request, res: Response) => {
        const newBrand = {
            brandId: uuidv4(),
            brand: String(req.body.brand.brand)
        }
        return res.json(await productService.addProductBrandService(newBrand));
    }

    updateBrandProduct = async (req: Request, res: Response) => {
        const brandUpdate = {
            brandId: req.body.brand.brand_id,
            brand: req.body.brand.brand
        }
        return res.json(await productService.updateProductBrandService(brandUpdate));
    }

    deleteBrandProduct = async (req: Request, res: Response) => {        
        return res.json(await productService.deleteProductBrandService(req.params.id));
    }

    getProductColorList = async (req: Request, res: Response) => {        
        return res.json(await productService.getProductColorListService());
    }

    getProductSizeList = async (req: Request, res: Response) => {        
        return res.json(await productService.getProductSizeListService());
    }

    addProduct = async (req: Request, res: Response) => {
        const productLine: ProductLineBody = req.body.product;
        const { imageProduct, name, brandId, gender, sold } = productLine
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
            sold: sold,
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

    updateProduct = async (req: Request, res: Response) => {        
        return res.json(await productService.updateProductService(req, res));
    }

    updateProductItem = async (req: Request, res: Response) => {
        return res.json(await productService.updateProductItemService(req, res));
    }

    removeProduct = async (req: Request, res: Response) => {
        return res.json(await productService.removeProductService(req, res));
    }        

    removeProductItem = async (req: Request, res: Response) => {
        return res.json(await productService.removeProductItemService(req.params.idProduct, req.params.idProductItem));
    }

    getProductDetails = async (req: Request, res: Response) => {
        return res.json(await productService.getProductDetailsService(req, res));
    }

}

export const productController = new ProductController();