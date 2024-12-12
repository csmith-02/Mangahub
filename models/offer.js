const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    manga: {
        type: mongoose.Types.ObjectId,
        ref: "Manga",
        required: true
    },
    offer: {
        type: Number,
        required: true,
        min: 0.01
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
}, { timestamps: true});

const Offer = mongoose.model('Offer', offerSchema)

module.exports = Offer;