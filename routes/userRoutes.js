const express = require('express');
const userController = require('../controllers/userController');
const { isLoggedIn, isGuest, isAuthor, isNotOfferAuthor } = require('../middlewares/auth');
const { validateId, validateOfferId, validateLogin, validateResult, validateSignup } = require('../middlewares/validators');
const { loginLimiter } = require('../middlewares/rateLimiters');
const router = express.Router();

router.get('/login', isGuest, userController.getUserLogin);

router.get('/new', isGuest, userController.new);

router.post('/login', loginLimiter, validateLogin, validateResult, isGuest, userController.login);

router.post('/new', isGuest, validateSignup, validateResult, userController.create);

router.get('/profile', isLoggedIn, userController.getProfile);

router.get('/logout', isLoggedIn, userController.logout);

router.put('/profile/:offerid/accept', validateOfferId, isLoggedIn, isNotOfferAuthor, userController.updateOfferStatusAccept);

router.put('/profile/:offerid/reject', validateOfferId, isLoggedIn, isNotOfferAuthor, userController.updateOfferStatusReject);

router.delete('/profile/:id', validateId, isLoggedIn, isAuthor, userController.deleteManga);

router.get('/profile/:id/offers', validateId, isLoggedIn, isAuthor, userController.viewOffers);

module.exports = router;