const express = require('express');
const mangaController = require('../controllers/mangaController');
const router = express.Router();
const multer = require('multer');
const { extname } = require('path');
const { validateId, validateOfferId, validateManga, validateResult, validateOffer } = require('../middlewares/validators');
const { isLoggedIn, isAuthor, isNotAuthor, isOfferAuthor } = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
    }
  });
  
const upload = multer({ storage: storage }).single('image');

router.get('/', mangaController.getAllManga);

router.get('/sell', isLoggedIn, mangaController.sell);

router.get('/:id', mangaController.getSingleManga);

router.get('/:id/edit', validateId, isLoggedIn, isAuthor, mangaController.getEditSingleManga);

router.post('/', isLoggedIn, validateManga, validateResult, upload, mangaController.postNewManga);

router.delete('/:id', validateId, isLoggedIn, isAuthor, mangaController.deleteManga);

router.put('/:id', validateId, isLoggedIn, isAuthor, upload, validateManga, validateResult, mangaController.updateSingleManga);

router.get('/:id/new', validateId, isLoggedIn, isNotAuthor, mangaController.newOffer);

router.post('/:id/new', validateId, isLoggedIn, isNotAuthor, validateOffer, validateResult, mangaController.postNewOffer);

router.delete('/:id/:offerid/remove', validateId, validateOfferId, isLoggedIn, isOfferAuthor, mangaController.deleteOffer);

module.exports = router;