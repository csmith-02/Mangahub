const Manga = require('../models/manga');
const Offer = require('../models/offer');

exports.getAllManga = (req, res, next)=> {

    let search;
    if (req.query.search) {
        let search = req.query.search;
        Manga.find({ $and: [{ active: true }, { $or: [{ details: {$regex: search, $options: 'i'}}, { title: { $regex: search, $options: 'i'}}]}]}).sort({ price: 'asc'})
            .then((manga)=>{
                
                res.render('items', { manga, search })
            })
            .catch(err=>next(err))
    } else {
        Manga.find({ active: true })
            .then((manga)=>{
                manga = manga.sort((a, b)=> a.price - b.price);
                res.render('items', { manga, search})
            })
            .catch(err=>next(err));
    }
}

exports.sell = (req, res, next)=>{
    let search;
    res.render('./manga/new', { search });
}

exports.getSingleManga = async (req, res, next)=>{
        try {
            let search;

            const manga = await Manga.findById(req.params.id).exec();

            const offers = await Offer.find({ manga: manga._id, status: 'pending' }).sort({offer: -1}).limit(1).exec()
            if (offers.length == 0) {
                const highestPrice = 'N/A'
                return res.render('manga/item', {manga, search, highestPrice});
            }

            const offer = offers[0]
            let highestPrice = "$" + offer.offer;
            return res.render('manga/item', {manga, search, highestPrice})
        } catch (err) {
            next(err);
        }
}

exports.postNewManga = (req, res, next)=>{
    if (!req.file) {
        // Must have an image to display
        let err = new Error();
        err.status = 400
        next(err);
    } else {

        Manga.create({
            title: req.body.title,
            seller: req.session.name,
            sellerId: req.session.user,
            condition: getCondition(req.body.condition),
            price: parseFloat(req.body.price).toFixed(2).toString(),
            details: req.body.details,
            image: `${req.file.filename}`
        }).then(manga=>{
            manga.save().then(()=>{
                req.flash('success', 'Post created!');
                req.session.save(()=>{
                    return res.redirect('/manga');
                });
            })
        }).catch(err=>{
            if (err.name === 'ValidationError')
                err.status = 400;
            next(err)
        });
    }
}

exports.deleteManga = (req, res, next) => {
    Manga.findById(req.params.id)
        .then((manga)=>{
            if (!manga) {
                let err = new Error();
                err.message = 'Invalid manga id';
                err.status = 400;
                return next(err);
            }
            Manga.deleteOne({ _id: manga._id })
                .then(()=>{
                    Offer.deleteMany({ manga: manga._id}).exec()
                        .then(()=>{
                            req.flash('success', 'Post has been deleted!')
                            req.session.save(()=>{
                                return res.redirect('/manga');
                            });
                        })
                        .catch(err=>next(err));
                })
                .catch(err=>next(err));
        })         
        .catch(err=>next(err))
}

exports.getEditSingleManga = (req, res, next) => {
    Manga.findById(req.params.id)
        .then((manga)=>{
            if (!manga) {
                let err = new Error();
                next(err);
                return;
            }
            let search;
            let conditionValue = manga.condition.toLowerCase().replace(" ", "_");
            res.render('manga/edit', { manga, conditionValue, search });
        })
        .catch(err=>next(err))
}

exports.updateSingleManga = (req, res, next) =>{

    let manga = req.body;

    manga['condition'] = getCondition(manga['condition']);
    manga['price'] = parseFloat(manga['price']).toFixed(2).toString();

    if (req.file) {
        manga['image'] = req.file.filename || "default.png";
    } else {
        manga['image'] = manga['current_image'];
    }


    Manga.findByIdAndUpdate(req.params.id, manga, {upsert: false, runValidators: true})
        .then((manga)=>{
            if (!manga) {
                let err = new Error('Invalid Manga id');
                err.status = 400;
                next(err);
                return;
            }
            req.flash('success', "Manga has been updated")
            req.session.save(()=>{
                res.redirect('/manga/' + req.params.id);
            });
        })
        .catch(err=>next(err))
}

function getCondition(condition) {
    let words;

    if (condition.includes("_")) {
        words = condition.substring(1).split("_");
        words = condition.charAt(0).toUpperCase() + words[0] + " " + words[1].charAt(0).toUpperCase() + words[1].substring(1);
    } else {
        words = condition.charAt(0).toUpperCase() + condition.substring(1);
    }
    return words;
}

exports.newOffer = (req, res, next) => {
    let search;
    let id = req.params.id;

    Manga.findById(id)
        .then((manga)=>{
            return res.render('manga/offer/new', {manga, search});
        })
        .catch(err=>next(err));
}

exports.postNewOffer = async(req, res, next) => {
    let userId = req.session.user;
    let mangaId = req.params.id;

    const offer = await Offer.create(
        {
            user: userId,
            manga: mangaId,
            offer: req.body.price
        }
    );

    offer.save()
        .then(()=>{
            Manga.findByIdAndUpdate(mangaId, { $inc: { offers: 1 } }, { runValidators: true})
                .then(()=>{
                    req.flash('success', 'Offer created!')
                    req.session.save(()=>{
                        return res.redirect(`/manga/${mangaId}`);
                    });
                })
                .catch(err=>next(err));
        })
        .catch(err=>next(err));
}

exports.deleteOffer = async(req, res, next) => {

    let offerid = req.params.offerid;
    let mangaid = req.params.id;

    await Offer.findByIdAndDelete(offerid);

    await Manga.findByIdAndUpdate(mangaid, { $inc: { offers: -1 }}, { runValidators: true});

    req.flash('success', 'Offer has been cancelled!');
    req.session.save(()=>{
        return res.redirect('/users/profile');
    });
    
}