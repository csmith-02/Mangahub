const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Like New', 'Used', 'Damaged', 'Severely Damaged']
    },
    price: {
        type: String,
        required: true,
        min: 0.01
    },
    details: {
        type: String,
        required: true,
        minLength: 12,
        maxLength: 600
    },
    image: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    offers: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
}, { timestamps: true});

const Manga = mongoose.model('Manga', mangaSchema)

module.exports = Manga;