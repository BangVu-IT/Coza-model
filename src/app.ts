import express, { Request, Response } from 'express'
import { ListProps } from './model/ListProps'
import { Product } from './model/Product'
import { Order } from './model/Order';

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

let arr: Product[] = [];

async function clientProduct() {
    const client = new Client(credentials);
    await client.connect();
    const products = await client.query("select * from public.product");
    await client.end();
    return products.rows;
}

// get data warehouse page
app.get('/', async (req, res) => {
    const clientResult: Product[] = await clientProduct();
    res.json(clientResult)
})


// get data home page
app.post('/products/', async (req, res) => {
    const clientResult: Product[] = await clientProduct();
    const listprops: ListProps = req.body;
    const { page, search, pagesize } = listprops
    let perPage = pagesize;
    let pageNumber = [];
    let arrProduct = clientResult;
    let count = 0;

    let start = (page * perPage) - perPage;
    let end = page * perPage;

    if (search) {
        arrProduct = clientResult.filter(item => (
            item.name.toUpperCase().includes(search.toUpperCase())
        ))
    } else {
        arrProduct = clientResult;
    }

    let lengProduct = arrProduct.length;

    let productPage = arrProduct.slice(start, end);
    for (let i = 0; i < lengProduct; i++) {
        if ((i + 1) % perPage == 0) {
            count += 1;
            pageNumber.push(count)
        }
    }
    if (lengProduct % perPage != 0) {
        count += 1;
        pageNumber.push(count)
    }
    res.json({ productPage, pageNumber });
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


let orders: Order[] = [{
        idOrder: "",
        createdAt: 0,
        fullname: "",
        phonenumber: 0,
        email: "",
        address: "",
        postcode: "",
        cart: {
            id: "",
            image: "",
            name: "",            
            price: 0,
            quantily: 0
        }
    }];

orders = []

app.post('/checkout/delivery', (req, res) => {
    let orderData: Order;
    orderData = req.body.dataOrder;
    if (orderData != null) {
        orders.push(orderData)
    }
    res.json(orders);
})

app.get('/orders', (req, res) => {
    res.json(orders);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})