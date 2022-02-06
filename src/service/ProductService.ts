import express, { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { pool } from "../connect-db/Client";
import { ListProps } from "../model/ListProps";
import { OrderWithDetail } from '../model/Order';
import { Product, ProductLine, ProductWithDetail } from "../model/Product";
import { User } from '../model/User';

const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");

class ProductService {

    getProductListService = async (page: number, inputSearch: string, rowsPerPage: number, category: string, priceValue1: number, priceValue2: number, gender: string, sortPrice: string) => {
        let productsList, pageNumber, categoryProduct, genderProduct, sortPriceProduct;

        if (category) {
            categoryProduct = `and pl2.brand_id = '${category}'`
        } else {
            categoryProduct = '';
        }

        if (sortPrice) {
            sortPriceProduct = `p.price ${sortPrice},`
        } else {
            sortPriceProduct = '';
        }

        if (gender) {
            genderProduct = `and pl2.gender = '${gender}'`            
        } else {
            genderProduct = '';            
        }

        if (inputSearch) {
            productsList = await pool.query(`SELECT * FROM product_line pl join brand b on pl.brand_id = b.brand_id join product p on
            pl.product_id = p.product_id join product_color pc on p.color_id = pc.color_id
            join product_size ps on p.size_id = ps.size_id where pl.product_id in
            (select pl2.product_id from product_line pl2 join brand b2 on pl2.brand_id
            = b2.brand_id join product p2 on pl2.product_id = p2.product_id
            where pl2."name" ILIKE '${inputSearch}%' ${categoryProduct} and p2.price between ${priceValue1} and ${priceValue2} ${genderProduct} group by pl2.product_id order by p.price asc limit ${rowsPerPage} offset (${page} * ${rowsPerPage}) - ${rowsPerPage}) order by ${sortPriceProduct} pl."created_At" desc`);

            pageNumber = await pool.query(`SELECT count(DISTINCT pl2.product_id) FROM product_line pl2 join product p on pl2.product_id = p.product_id
            join brand b on pl2.brand_id = b.brand_id where pl2."name" ILIKE '${inputSearch}%' ${categoryProduct} ${genderProduct} and p.price between ${priceValue1} and ${priceValue2}`);

        } else {
            productsList = await pool.query(`select * from product_line pl join brand b on pl.brand_id = b.brand_id join product p on
            pl.product_id = p.product_id join product_color pc on p.color_id = pc.color_id 
            join product_size ps on p.size_id = ps.size_id where pl.product_id in
            (select pl2.product_id from product_line pl2 join brand b2 on pl2.brand_id
            = b2.brand_id join product p2 on pl2.product_id = p2.product_id
            where p2.price between ${priceValue1} and ${priceValue2} ${categoryProduct} ${genderProduct} group by pl2.product_id limit ${rowsPerPage} offset (${page} * ${rowsPerPage}) - ${rowsPerPage})
            order by ${sortPriceProduct} pl."created_At" desc`);

            pageNumber = await pool.query(`SELECT count(DISTINCT pl2.product_id) FROM product_line pl2 join product p on pl2.product_id = p.product_id
            join brand b on pl2.brand_id = b.brand_id where p.price between ${priceValue1} and ${priceValue2} ${categoryProduct} ${genderProduct}`);
        }

        const products = productsList.rows;
        const pageNumberProduct = Number(pageNumber.rows[0].count);
        let productListAll: ProductLine[] = [];
        let productId: string[] = [];

        products.map(item => productId.push(item.product_id));

        productId = Array.from(new Set(productId));

        productId.map(product_id => {
            const product: ProductWithDetail = {
                id: product_id,
                imageProduct: "",
                name: "",
                brandId: "",
                brand: "",
                gender: "",
                createdAt: "",
                updatedAt: "",
                productItem: []
            }

            products.map(productsItem => {
                if (productsItem.product_id == product_id) {
                    product.name = productsItem.name,
                        product.imageProduct = productsItem.image_product,
                        product.brandId = productsItem.brand_id,
                        product.brand = productsItem.brand,
                        product.gender = productsItem.gender,
                        product.createdAt = productsItem.created_At,
                        product.updatedAt = productsItem.updated_At,
                        product.productItem.push({
                            productItemId: productsItem.product_item_id,
                            productId: productsItem.product_id,
                            image: productsItem.image,
                            colorId: productsItem.color_id,
                            color: productsItem.color,
                            sizeId: productsItem.size_id,
                            size: productsItem.size,
                            price: productsItem.price,
                            quantity: productsItem.quantity
                        })
                }
            });
            productListAll.push(product)
        })

        return ({ productListAll, pageNumberProduct });
    }

    getProductBrandListService = async () => {
        const brandList = await pool.query(`select * from brand`);
        return brandList.rows;
    }

    getProductColorListService = async () => {
        const ColorList = await pool.query(`select * from product_color`);
        return ColorList.rows;
    }

    getProductSizeListService = async () => {
        const SizeList = await pool.query(`select * from product_size`);
        return SizeList.rows;
    }

    addProductService = async (newProduct: any) => {
        await pool.query(`INSERT INTO public.product_line
        (product_id, image_product, "name", brand_id, gender, "created_At", "updated_At")
        VALUES('${newProduct.id}', '${newProduct.imageProduct}', '${newProduct.name}', '${newProduct.brand}', '${newProduct.gender}', '${newProduct.createdAt}', '${newProduct.updatedAt}')`);

        await pool.query(`INSERT INTO public.product
        (product_item_id, product_id, color_id, size_id, price, quantity, image)
        VALUES('${newProduct.productItem.productItemId}', '${newProduct.productItem.productId}', '${newProduct.productItem.color}', '${newProduct.productItem.size}', ${newProduct.productItem.price}, ${newProduct.productItem.quantity}, '${newProduct.productItem.image}')`);
    }

    updateProductService = async (req: Request, res: Response) => {
        let id = req.params.idProduct;
        let date = new Date(new Date().getTime());
        const listprops: ListProps = req.body.product;
        const { imageProduct, name, brandId, gender } = listprops;
        await pool.query(`UPDATE public.product_line
        SET image_product='${imageProduct}', "name"='${name}', brand_id='${brandId}', gender='${gender}', "updated_At"='${date.toLocaleString('en-GB')}'
        WHERE product_id='${id}'`);
    }

    removeProductService = async (req: Request, res: Response) => {
        await pool.query(`DELETE FROM public.product_line WHERE product_id='${req.params.idProduct}'`);
        await pool.query(`DELETE FROM public.product WHERE product_id='${req.params.idProduct}'`);
    }

    addProductItemService = async (newProduct: Product) => {
        await pool.query(`Do
        $$
        begin  		
            if exists(select * from product where color_id = '${newProduct.colorId}' and size_id = '${newProduct.sizeId}' and product_id = '${newProduct.productId}') then
                UPDATE public.product
                SET price=${newProduct.price}, quantity=quantity + ${newProduct.quantity}, image='${newProduct.image}'
                WHERE product_id='${newProduct.productId}' and color_id = '${newProduct.colorId}' and size_id = '${newProduct.sizeId}';
            else
                INSERT INTO public.product
                (product_item_id, product_id, color_id, size_id, price, quantity, image)
                VALUES('${newProduct.productItemId}', '${newProduct.productId}', '${newProduct.colorId}', '${newProduct.sizeId}', ${newProduct.price}, ${newProduct.quantity}, '${newProduct.image}');
            end if;
        end;
        $$`);
    }

    updateProductItemService = async (req: Request, res: Response) => {
        let id = req.params.idProductItem;
        const listprops: ListProps = req.body.productItem;
        const { image, colorId, sizeId, quantity, price } = listprops;
        await pool.query(`UPDATE public.product
        SET color_id='${colorId}', size_id='${sizeId}', price=${price}, quantity=${quantity}, image='${image}'
        WHERE product_item_id='${id}'`);
    }

    removeProductItemService = async (idProduct: string, idProductItem: string) => {
        await pool.query(`Do
        $$
        begin  	
            if (select count(*) from product_line join product on product_line.product_id = product.product_id
                where product.product_id = '${idProduct}') <= 1 then
                DELETE FROM public.product_line
                WHERE product_id='${idProduct}';
                DELETE FROM public.product
		        WHERE product_item_id='${idProductItem}';
            else
                DELETE FROM public.product
                WHERE product_item_id='${idProductItem}';
            end if;
        end;
        $$`);
    }

    getProductDetailsService = async (req: Request, res: Response) => {
        let idProduct = req.params.idProduct;
        const product = await pool.query(`select * from product_line join brand on product_line.brand_id = brand.brand_id join product on
        product_line.product_id = product.product_id
        join product_color on product.color_id = product_color.color_id 
        join product_size on product.size_id = product_size.size_id where product_line.product_id in
        (select product_line.product_id from product_line group by product_line.product_id)
        and product_line.product_id = '${idProduct}' and product.product_id = '${idProduct}'`);

        const productDetails = product.rows;
        let productId: string[] = [];
        let productListAll: ProductLine[] = [];

        productDetails.map(item => productId.push(item.product_id));

        productId = Array.from(new Set(productId));

        productId.map(product_id => {
            const product: ProductWithDetail = {
                id: product_id,
                imageProduct: "",
                name: "",
                brandId: "",
                brand: "",
                gender: "",
                createdAt: "",
                updatedAt: "",
                productItem: []
            }

            productDetails.map(productsItem => {
                if (productsItem.product_id == product_id) {
                    product.name = productsItem.name,
                        product.imageProduct = productsItem.image_product,
                        product.brandId = productsItem.brand_id,
                        product.brand = productsItem.brand,
                        product.gender = productsItem.gender,
                        product.createdAt = productsItem.created_At,
                        product.updatedAt = productsItem.updated_At,
                        product.productItem.push({
                            productItemId: productsItem.product_item_id,
                            productId: productsItem.product_id,
                            image: productsItem.image,
                            colorId: productsItem.color_id,
                            color: productsItem.color,
                            sizeId: productsItem.size_id,
                            size: productsItem.size,
                            price: productsItem.price,
                            quantity: productsItem.quantity
                        })
                }
            });
            productListAll.push(product)
        })

        return productListAll[0];
    }

}

export const productService = new ProductService();