const manga = require('../models/manga');
const Offer = require('../models/offer');

exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already')
        req.session.save(()=>{
            return res.redirect('/users/profile');
        });
    }
}

exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You must login first to access this page.');
        req.session.save(()=>{
            return res.redirect('/users/login');
        });
    }
}

exports.isAuthor = (req, res, next) => {
    let mangaId = req.params.id;

    manga.findById(mangaId)
        .then(manga=>{
            if (manga) {
                if (manga.sellerId == req.session.user) {
                    return next();
                } else {
                    let err = new Error("Unauthorized to access the resource.")
                    err.status = 401;
                    return next(err);
                }
            } else {
                let err = new Error("Cannot find a manga with id " + mangaId);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err=>next(err));
}

exports.isOfferAuthor = async(req, res, next) => {
    try {
        let id = req.session.user;
        let offerId = req.params.offerid;

        const offer = await Offer.findById(offerId).populate('user').populate('manga').exec();

        if (offer.user._id == id) {
            return next();
        } else {
            let err = new Error("Cannot find a offer with id " + offerId);
            err.status = 404;
            return next(err);
        }
    } catch(err) {
        next(err);
    }
}

exports.isNotOfferAuthor = async(req, res, next) => {
    try {
        let id = req.session.user;
        let offerId = req.params.offerid;

        const offer = await Offer.findById(offerId).populate('user').populate('manga').exec();

        if (offer.user._id == id) {
            let err = new Error("Cannot find a offer with id " + offerId);
            err.status = 404;
            return next(err);
        } else {
            return next();
        }
    } catch(err) {
        next(err);
    }
}

exports.isNotAuthor = (req, res, next) => {
    let mangaId = req.params.id;

    manga.findById(mangaId)
        .then(manga=>{
            if (manga) {
                if (manga.sellerId == req.session.user) {
                    let err = new Error("Cannot make an offer on your own post.")
                    err.status = 401;
                    return next(err);
                } else {
                    return next();
                }
            } else {
                let err = new Error("Cannot find a manga with id " + mangaId);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err=>next(err));
}