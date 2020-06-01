const express =  require('express');

let { verificarToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//Obtener todos los productos
app.get('/producto', verificarToken, (req, res) => {
    //traer todos los productos
    //populate: usuario y categoria
    //Paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        });

});

//Obtener los productos por ID
app.get('/producto/:id', (req, res) => {
    //populate: usuario y categoria

    let id = req.params.id;

    Producto.findById( id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if( !productoDB ){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

    });

});

//Crear un producto
app.post('/producto', verificarToken, (req, res) =>{

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save( (err, productoDB) => {

        if( err ){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});


//Buscar productos
app.get('/producto/buscar/:termino', verificarToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });

});


//Actualizar un producto
app.put('/producto/:id',verificarToken,  (req, res) =>{
    //grabar el usuario
    //grabar una categoria del listado

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if( err ){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.categoria = body.categoria;

        productoDB.save( (err, productoGuardado) => {
           
            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok:true,
                producto: productoGuardado
            });
            
        });

    });


});


//Actualizar el disponible del producto
app.delete('/producto/:id', verificarToken, (req, res) =>{
    
    let id = req.params.id;

    Producto.findById( id, (err, productoDB) => {

        if( err ){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save( (err, productoBorrado) => {

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto no disponible'
            });

        });

    });

});




module.exports = app;