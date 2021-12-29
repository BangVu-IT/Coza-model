import express, { Request, Response } from 'express'
import { ListProps } from './model/ListProps'
import { Product, products } from './model/Product'
import { Cart, Order } from './model/Order';

const app = express()
var cors = require('cors')
app.use(cors())
const port = 5000
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let arr: Product[] = products;

app.get('/', (req, res) => {
    res.json(arr);
})

app.post('/products/', (req, res) => {
    const listprops: ListProps = req.body;
    const { page, search, pagesize } = listprops  

    let perPage = pagesize;
    let pageNumber = [];
    let arrProduct = arr;
    let count = 0;

    let start = (page * perPage) - perPage;
    let end = page * perPage;

    if (search) {
        arrProduct = arr.filter(item => (
            item.name.toUpperCase().includes(search.toUpperCase())
        ))
    } else {
        arrProduct = arr;
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

app.delete('/delete/:idProduct', (req, res) => {
    let idProduct = req.params.idProduct;
    let productFilter = arr.filter(item =>
        item.id !== idProduct
    )
    arr = productFilter;
    res.json(arr)
})

app.post('/add/', (req, res) => {
    const listprops: ListProps = req.body;
    const { image, name, brance, price } = listprops
    let newProduct = {
        id: String(Math.random()),
        image: image,
        name: name,
        brance: brance,
        price: price
    }
    arr.push(newProduct)
    res.json(arr)
})

app.put('/update/:idProduct', (req, res) => {    
    const listprops: ListProps = req.body;
    const { image, name, brance, price } = listprops
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == req.params.idProduct) {
            arr[i].image = image;
            arr[i].name = name;
            arr[i].brance = brance;
            arr[i].price = price;
        }
    }
    res.json(arr)
})

app.get('/search/:inputValue', (req, res) => {
    let filterProduct = arr.filter(item => (
        item.name.toUpperCase().includes(req.params.inputValue.toUpperCase())
    ))
    if (req.params.inputValue == null) {
        res.json(products)
    }
    res.json(filterProduct);
})

app.get('/search', (req, res) => {
    res.json(products);
})

app.get('/product/:idProduct', (req, res) => {
    let idProduct = req.params.idProduct;
    let productDetails = arr.filter(item => (
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