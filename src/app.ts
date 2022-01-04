import express, { Request, Response } from 'express'
import { ListProps } from './model/ListProps'
import Order, { OrderWithDetail } from './model/Order';
import { Product } from './model/Product'
import { User } from './model/User';
import { QueryResult } from 'pg';
import { Cart } from './model/Cart';

const app = express()
var cors = require('cors')
app.use(cors())
const port = 5000
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const { Client } = require('pg')
const { v4: uuidv4 } = require('uuid');

const credentials = {
    user: 'admin',
    host: 'localhost',
    database: 'product',
    password: '0782673677',
    port: 5432,
};

async function clientProduct() {
    const client = new Client(credentials);
    await client.connect();
    const products = await client.query("select * from public.product");
    await client.end();
    return products.rows;
}

async function getListCart() {
    const client = new Client(credentials);
    await client.connect();
    const cartProduct = await client.query(`select order_product.order_id, order_product.cart_id, product.image, product."name",
    product.brand, product.price, order_product.quantity
    from order_product join 
    product on order_product.id = product.id join
    "order" on order_product.order_id = "order".order_id where "order".user_id = '1' and "order".istemporary = false
    order by order_product.cart_id`);
    await client.end();
    return cartProduct.rows;
}

async function getReductionQuantity(id: string) {
    const client = new Client(credentials);
    await client.connect();
    await client.query(`Do
    $$
    begin  	
        if (select order_product.quantity from order_product where cart_id = '${id}') <= 1 then
            UPDATE public.order_product SET quantity = 1
            WHERE cart_id='${id}';
        else
            UPDATE public.order_product SET quantity = quantity - 1
            WHERE cart_id='${id}';
        end if;
    end;
    $$`);
    await client.end();
}

async function getIncreaseQuantity(id: string) {
    const client = new Client(credentials);
    await client.connect();
    await client.query(`UPDATE public.order_product
    SET quantity=quantity + 1
    WHERE cart_id = '${id}'`);
    await client.end();
}

async function getListOrder(page: number, pageSize: number) {
    const client = new Client(credentials);
    await client.connect();    
    const cartProduct: QueryResult = await client.query(`select * from "user" join "order" on "user".user_id = "order".user_id join
    order_product on order_product.order_id = "order".order_id join 
    product on order_product.id = product.id
    where "order".order_id in
    (select order_id from "order" where
    "order".user_id = '1' and "order".istemporary = true group by "order".order_id limit ${pageSize} offset (${page} * ${pageSize}) - ${pageSize})`);
    const pageNumberOrder = await client.query(`select "order".order_id from "order" where "order".user_id = '1' and "order".istemporary = true group by order_id`);
    await client.end();

    const listOrdersProduct = cartProduct.rows;
    const pageNumber = pageNumberOrder.rows.length
    let listOrders: OrderWithDetail[] = [];
    let idOrder: string[] = [];
    let pageNumbers = [];

    listOrdersProduct.map(item => idOrder.push(item.order_id));

    idOrder = Array.from(new Set(idOrder));

    idOrder.map(order_id => {
        const order: OrderWithDetail = {
            id: order_id,
            userId: "1",
            createdAt: "",
            isTemporary: false,
            orderProducts: [],
            user: {
                id: "",
                fullName: "",
                phoneNumber: 113,
                email: "",
                address: "",
                postcode: ""
            }
        }

        listOrdersProduct.map(orderItem => {
            if (orderItem.order_id == order_id) {
                order.createdAt = orderItem.createat,
                order.isTemporary = orderItem.istemporary,
                order.orderProducts.push({
                    id: orderItem.cart_id,
                    orderId: orderItem.order_id,
                    idProduct: orderItem.id,
                    quantity: orderItem.quantity,
                    price: orderItem.price,
                    product: {
                        id: orderItem.id,
                        image: orderItem.image,
                        name: orderItem.name,
                        brand: orderItem.brand,
                        price: orderItem.price
                    }
                });
                order.user = {
                    id: orderItem.user_id,
                    fullName: orderItem.fullname,
                    phoneNumber: orderItem.phonenumber,
                    email: orderItem.email,
                    address: orderItem.address,
                    postcode: orderItem.postcode
                }
            }
        });        
        listOrders.push(order)
    })    

    let count = 0;

    for (let i = 0; i < pageNumber; i++) {
        if ((i + 1) % pageSize == 0) {
            count += 1;
            pageNumbers.push(count)
        }
    }
    if (pageNumber % pageSize != 0) {
        count += 1;
        pageNumbers.push(count)
    }
    
    return {listOrders, pageNumbers};
}

// get data warehouse page
app.get('/', async (req, res) => {
    const clientResult: Product[] = await clientProduct();
    res.json(clientResult)
})

// get data home page
app.post('/products/', async (req, res) => {
    const listprops: ListProps = req.body;
    const { page, search, pagesize } = listprops
    let products, pageNumber;
    if (search) {
        const client = new Client(credentials);
        await client.connect();
        products = await client.query(`SELECT * FROM product WHERE name ILIKE '${search}%' limit ${pagesize} offset (${page} * ${pagesize}) - ${pagesize}`);
        pageNumber = await client.query(`Select count(*) from public.product where name ILIKE '${search}%'`);
        await client.end();
    } else {
        const client = new Client(credentials);
        await client.connect();
        products = await client.query(`Select * from public.product LIMIT ${pagesize}
        OFFSET (${page} * ${pagesize}) - ${pagesize}`);
        pageNumber = await client.query("Select count(*) from public.product");
        await client.end();
    }

    let arrProduct = products.rows;
    let arrPageNumber = [];
    const totalPageNumber = Number(pageNumber.rows[0].count);
    let count = 0;

    for (let i = 0; i < totalPageNumber; i++) {
        if ((i + 1) % pagesize == 0) {
            count += 1;
            arrPageNumber.push(count)
        }
    }
    if (totalPageNumber % pagesize != 0) {
        count += 1;
        arrPageNumber.push(count)
    }

    res.json({ arrProduct, arrPageNumber });
})

// delete product
app.delete('/delete/:idProduct', async (req, res) => {
    const client = new Client(credentials);
    await client.connect();
    await client.query(`DELETE FROM public.product WHERE id = '${req.params.idProduct}'`);
    await client.end();
    const clientResult: Product[] = await clientProduct();
    res.json(clientResult)
})

// add product
app.post('/add/', async (req, res) => {
    const listprops: ListProps = req.body;
    const { image, name, brand, price } = listprops
    let newProduct = {
        id: uuidv4(),
        image: image,
        name: name,
        brand: brand,
        price: price
    }

    const client = new Client(credentials);
    await client.connect();
    await client.query(`INSERT INTO public.product (id, image, name, brand, price)
    VALUES('${newProduct.id}', '${newProduct.image}', '${newProduct.name}', '${newProduct.brand}', ${newProduct.price})`);
    await client.end();

    const clientResult: Product[] = await clientProduct();
    res.json(clientResult)
})

// update product
app.put('/update/:idProduct', async (req, res) => {
    let id = req.params.idProduct;
    const listprops: ListProps = req.body;
    const { image, name, brand, price } = listprops;

    const client = new Client(credentials);
    await client.connect();
    await client.query(`UPDATE public.product
    SET image='${image}', "name"='${name}', brand='${brand}', price=${price}
    WHERE id='${id}'`);
    await client.end();

    const clientResult: Product[] = await clientProduct();
    res.json(clientResult)
})

app.get('/search/:inputValue', async (req, res) => {
    const clientResult: Product[] = await clientProduct();
    let filterProduct = clientResult.filter(item => (
        item.name.toUpperCase().includes(req.params.inputValue.toUpperCase())
    ))
    res.json(filterProduct);
})

app.get('/search', async (req, res) => {
    const clientResult: Product[] = await clientProduct();
    res.json(clientResult);
})

// product details
app.get('/product/:idProduct', async (req, res) => {
    const clientResult: Product[] = await clientProduct();
    let idProduct = req.params.idProduct;
    let productDetails = clientResult.filter(item => (
        item.id == idProduct
    ))
    let itemProduct;
    productDetails.forEach(item => {
        itemProduct = item
    })
    res.json(itemProduct);
})

app.post('/checkout/delivery', async (req, res) => {    
    let userInformation: User;
    userInformation = req.body.dataOrder;
    const client = new Client(credentials);
    await client.connect();
    await client.query(`UPDATE public."user"
    SET fullname='${userInformation.fullName}', phonenumber='${userInformation.phoneNumber}', email='${userInformation.email}', address='${userInformation.address}', postcode='${userInformation.postcode}'
    WHERE user_id='1';`);
    await client.query(`UPDATE public."order"
    SET istemporary=true WHERE order_id='${req.body.idOrder}'`);
    await client.end();
})

app.post('/orders', async (req, res) => {
    const listprops: ListProps = req.body;
    const { page, pagesize } = listprops
    const listOrdersProduct = await getListOrder(page, pagesize);
    res.json(listOrdersProduct);
})

app.post('/carts/:idProduct', async (req, res) => {
    const client = new Client(credentials);
    await client.connect();
    const checkEmpty = await client.query(`select order_id from "order" where user_id = '1' and istemporary = false`);    

    if (checkEmpty.rows[0] !== undefined) {
        await client.query(`Do
        $$
        begin
            if exists(select * from order_product join "order" on "order".order_id = order_product.order_id
            where id = '${req.params.idProduct}' and "order".istemporary = false) then
                UPDATE public.order_product
                SET quantity = quantity + ${req.body.quantity} where id = '${req.params.idProduct}' and order_id = '${checkEmpty.rows[0].order_id}';
            else
                INSERT INTO public.order_product (cart_id, order_id, id, quantity, price)
                VALUES('${uuidv4()}' ,'${checkEmpty.rows[0].order_id}', '${req.params.idProduct}', ${req.body.quantity}, ${req.body.price});
            end if;
        end;
        $$`);        
    } else {
        let idOrder = uuidv4();
        await client.query(`INSERT INTO public."order" (order_id, user_id, createat, istemporary)
        VALUES('${idOrder}', '1', '${new Date()}', false);`);
        await client.query(`INSERT INTO public.order_product (cart_id, order_id, id, quantity, price)
        VALUES('${uuidv4()}' ,'${idOrder}', '${req.params.idProduct}', ${req.body.quantity}, ${req.body.price})`);        
    }
    await client.end();

    return res.json([]);
})

app.get('/checkout/cart', async (req, res) => {
    const listCarts: Cart[] = await getListCart();
    res.json(listCarts);
})

app.get('/cart/reduction/:idCart', async (req, res) => {
    await getReductionQuantity(req.params.idCart);

    const listCarts: Cart[] = await getListCart();
    res.json(listCarts);
})

app.get('/cart/increase/:idCart', async (req, res) => {
    await getIncreaseQuantity(req.params.idCart);

    const listCarts: Cart[] = await getListCart();
    res.json(listCarts);
})

app.delete('/cart/item/:cart_id', async (req, res) => {
    const client = new Client(credentials);
    await client.connect();
    await client.query(`DELETE FROM public.order_product
    WHERE cart_id='${req.params.cart_id}'`);
    await client.end();

    const listCarts: Cart[] = await getListCart();
    res.json(listCarts);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})