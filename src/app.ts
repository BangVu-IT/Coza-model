import express, { Request, Response } from 'express'
import { ListProps } from './model/ListProps'
import { Order } from './model/Order';
import { Product } from './model/Product'
import { User } from './model/User';

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
    const cartProduct = await client.query(`select order_product.order_id, order_product.cart_id, product.image, product."name", product.brance, product.price, order_product.quantity
    from order_product join 
    product on order_product.id = product.id join
    "order" on order_product.order_id = "order".order_id where "order".user_id = '1' and "order".istemporary = false`);
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

async function getListOrder() {
    const client = new Client(credentials);
    await client.connect();
    const cartProduct = await client.query(`select "order".createat, "user".fullname, "user".phonenumber, "user".email, "user".address, "user".postcode, 
    order_product.cart_id, product.image, product."name", order_product.price, order_product.quantity
    from "user" join 
    "order" on "user".user_id = "order".user_id join
    order_product on order_product.order_id = "order".order_id join 
    product on order_product.id = product.id 
    where "order".user_id = '1'`);
    await client.end();
    return cartProduct.rows;
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
    const { image, name, brance, price } = listprops
    let newProduct = {
        id: uuidv4(),
        image: image,
        name: name,
        brance: brance,
        price: price
    }

    const client = new Client(credentials);
    await client.connect();
    await client.query(`INSERT INTO public.product (id, image, name, brance, price)
    VALUES('${newProduct.id}', '${newProduct.image}', '${newProduct.name}', '${newProduct.brance}', ${newProduct.price})`);
    await client.end();

    const clientResult: Product[] = await clientProduct();
    res.json(clientResult)
})

// update product
app.put('/update/:idProduct', async (req, res) => {
    let id = req.params.idProduct;
    const listprops: ListProps = req.body;
    const { image, name, brance, price } = listprops;

    const client = new Client(credentials);
    await client.connect();
    await client.query(`UPDATE public.product
    SET image='${image}', "name"='${name}', brance='${brance}', price=${price}
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
    SET istemporary=true 
    WHERE order_id='${req.body.idOrder}'`);
    await client.end();
})

app.get('/orders', async (req, res) => {
    const listOrders: Order[] = await getListOrder();
    res.json(listOrders);
})

app.post('/carts/:idProduct', async (req, res) => {

    const client = new Client(credentials);
    await client.connect();
    const checkEmpty = await client.query(`select order_id from "order" where user_id = '1' and istemporary = false`);

    if (checkEmpty.rows[0] !== undefined) {
        await client.query(`Do
        $$
        begin  	
            if exists(select * from order_product op where id = '${req.params.idProduct}') then
                UPDATE public.order_product
                SET quantity = quantity + ${req.body.quantity} where id = '${req.params.idProduct}';
            else
                INSERT INTO public.order_product (cart_id, order_id, id, quantity, price)
                VALUES('${uuidv4()}' ,'${checkEmpty.rows[0].order_id}', '${req.params.idProduct}', ${req.body.quantity}, ${req.body.price});
            end if;
        end;
        $$`);
    } else {
        let idOrder = uuidv4();
        await client.query(`INSERT INTO public."order" (order_id, user_id, createat, istemporary)
        VALUES('${idOrder}', '1', '2021-1-1', false);`);
        await client.query(`INSERT INTO public.order_product (cart_id, order_id, id, quantity, price)
        VALUES('${uuidv4()}' ,'${idOrder}', '${req.params.idProduct}', ${req.body.quantity}, ${req.body.price})`);
    }

})

app.get('/checkout/cart', async (req, res) => {
    const listCarts: Cart[] = await getListCart();
    res.json(listCarts)
})

app.get('/cart/reduction/:idCart', async (req, res) => {
    await getReductionQuantity(req.params.idCart);    

    const listCarts: Cart[] = await getListCart();
    res.json(listCarts)
})

app.get('/cart/increase/:idCart', async (req, res) => {
    await getIncreaseQuantity(req.params.idCart);    

    const listCarts: Cart[] = await getListCart();
    res.json(listCarts)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})