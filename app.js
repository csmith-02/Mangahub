const express = require('express');
const morgan = require('morgan');
const mangaRoutes = require('./routes/mangaRoutes');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');

const app = express();

let url = '' // MongoDB Atlas Cluster SRV Connection String

app.set('view engine', 'ejs');

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

mongoose.connect(url)
.then(()=>{
    app.listen('3000', 'localhost', ()=>{
        console.log('Server is running on port 3000...')
    })
}).catch(err=>{
    console.log(err.message);
});

app.use(
    session({
        secret: "super-random-secret",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: url}),
        cookie: {maxAge: 60*60*1000}
    })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.get('/', (req, res)=>{
    let search;
    res.render('index', { search });
});

app.use('/manga', mangaRoutes);

app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err)
});

app.use((err, req, res, next)=>{
    let search;
    if(!err.status) {
        err.status = 500;
        err.message = "Internal Server Error";
    }

    res.status(err.status);
    res.render('error', { err, search});
});