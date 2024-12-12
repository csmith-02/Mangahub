const {body, validationResult} = require('express-validator');

exports.validateId = (req, res, next) => {

    let id = req.params.id;

    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid manga id');
        err.status = 400;
        return next(err);
    }
    
    next();
}

exports.validateOfferId = (req, res, next) => {
    let offerid = req.params.offerid;
    if(!offerid.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid offer id');
        err.status = 400;
        return next(err);
    }
    next();
}

exports.validateSignup = [
    body('firstName', 'First name cannot be empty.').notEmpty().trim().escape(),
    body('lastName', 'Last name cannot be empty.').notEmpty().trim().escape(),
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 4 characters and at most 64 characters.').isLength({ min: 4, max: 64}),
]

exports.validateLogin = [
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
    body('password', 'Password must be at least 4 characters and at most 64 characters.').isLength({ min: 4, max: 64})
];

exports.validateOffer = [
    body('price', 'Price must be at least 0.01').isFloat({ min: 0.01 }).escape(),
];

exports.validateManga = [
    body('title', 'Title cannot be empty').notEmpty().trim().escape(),
    body('price', 'Price cannot be below 0.01').isFloat({ min: 0.01}).escape(),
    body('details', 'Details must be between at least 12 and 600 characters').trim().isLength({ min: 12, max: 600})
]


exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        req.session.save(()=>{
            res.redirect('back');
        })
        return;
    } else {
        return next();
    }
}