import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import { Server } from 'socket.io';
import services from "../src/dao/config.js";

const app = express();
const PORT = 8083;

const server = app.listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en el puerto ${server.address().port}`);
});
server.on("Error", error => console.log(`Error en servidor ${error}`));

const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(express.static(__dirname+'/public'));

app.engine(
    "handlebars",
    handlebars.engine()
);

app.set('views', './views');
app.set('view engine', 'handlebars');

io.on('connection', async(socket) => {
    console.log('Un cliente se ha conectado');
    socket.emit('messages', await services.messagesService.getAll());
    socket.emit('products', {products : await services.productsService.getAll()});

    socket.on('new-message', async(data) => {
        try {console.log(data)
            await services.messagesService.save(data);
            data.compr = await services.messagesService.calculateCompr();
            console.log("COM",data.compr)
            io.sockets.emit('messages', [data]);
        } catch (error) {
            console.error("new-product",error);
        }
    });

    socket.on('new-product', async(data) => {
        try {
            await services.productsService.save(data);

            try {
                let productosAll = await services.productsService.getAll();
                io.sockets.emit('products', {products : productosAll});
            } catch (error) {
                console.error("products-socket-emit",error);
            }
        } catch (error) {
            console.error("new-product",error);
        }
    });
})

app.get("/", async(req, res) => {
    try {
        let productosAll = await services.productsService.getAll();
        res.render('indexForm');
    } catch (error) {
        console.error("/",error)
    }
});


app.get("/api/products-test", async(req, res) => {
    let testProducts = await services.productsService.populate(5);
    res.send(testProducts);
});

