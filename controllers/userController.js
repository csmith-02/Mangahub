const Manga = require('../models/manga');
const Offer = require('../models/offer');
const user = require('../models/user');
const model = require('../models/user');

exports.new = (req, res)=>{
    let search;
    return res.render('user/signup', {search});
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);
    user.save()
    .then(()=> {
        req.flash('success', 'Account has been created!');
        req.session.save(()=>{
            return res.redirect('/users/login');
        });
    })
    .catch(err=>{

        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            req.session.save(()=>{
                res.redirect('/users/new');
            });
            return
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');
            req.session.save(()=>{
                res.redirect('/users/new');
            });
            return
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    let search;
    return res.render('user/login', {search});
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Invalid email address');  
            req.session.save(()=>{
                return res.redirect('/users/login');
            });
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.name = user.firstName + ' ' + user.lastName;
                    req.flash('success', 'You have successfully logged in');
                    req.session.save(()=>{
                        return res.redirect('/users/profile');
                    });
                } else {
                    req.flash('error', 'Invalid password');      
                    req.session.save(()=>{
                        return res.redirect('/users/login');
                    });
                }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.getProfile = async(req, res, next) => {
    let search;

    try {
       const u = await user.findById(req.session.user).exec();
       const m = await Manga.find({ sellerId: req.session.user }).exec();

        const offers = await Offer.find({ user: req.session.user }).populate('manga').populate('user').exec();

       return res.render('user/profile', {search, user: u, manga: m, offers});
    } catch(err) {
        next(err);
    }
}

exports.logout = (req, res, next) => {
    req.session.destroy(err=>{
        if(err) 
            return next(err);
        else
            res.redirect('/users/login');  
    });
}

exports.viewOffers = async(req, res, next) => {
    let search;

    let mangaId = req.params.id;

    const offers = await Offer.find({ manga: mangaId, status: 'pending' }).populate('manga').exec();

    return res.render('user/offers', {search, offers})
}

exports.updateOfferStatusAccept = async(req, res, next) => {

    let offerid = req.params.offerid;

    const offer = await Offer.findByIdAndUpdate(offerid, { status: 'accepted' }, {runValidators: true}).populate('manga');

    let result = await Offer.updateMany({ _id: { $ne: offerid }}, { $set: { status: 'rejected'}}).exec();

    await Manga.findByIdAndUpdate(offer.manga._id, { $inc: { offers: -1 * result.modifiedCount - 1 }, active: false }, {runValidators: true}).exec();

    req.flash('success', 'Offer accepted!');
    req.session.save(()=>{
        return res.redirect(`/users/profile/${offer.manga._id}/offers`);
    });
}

exports.updateOfferStatusReject = async(req, res, next) => {

    let offerid = req.params.offerid;

    const offer = await Offer.findByIdAndUpdate(offerid, { status: 'rejected' }, {runValidators: true}).populate('manga');

    req.flash('success', 'Offer rejected!')
    req.session.save(()=>{
        return res.redirect(`/users/profile/${offer.manga._id}/offers`);
    });
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
                                return res.redirect('/users/profile');
                            });
                        })
                        .catch(err=>next(err));
                })
                .catch(err=>next(err));
        })         
        .catch(err=>next(err))
}