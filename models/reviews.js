const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const ReviewSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter your name!'
    },
    rating: {
        type: Number,
        trim:true,
        required: 'Please enter a rating'
    },
    review: {
        type: String,
        trim: true,
        required: 'please enter a review'
    },
    created: {
        type: Date,
        default: Date.now
    },
    restaurantID: {
        type: String
    }

});

module.exports = mongoose.model('reviews', ReviewSchema);