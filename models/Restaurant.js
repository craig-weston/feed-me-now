const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const restaurantSchema = new mongoose.Schema({
    geometry: {
        type: String,
        trim: true,
        required: 'Please enter a restaurant name!'
    },
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String,

});

module.exports = mongoose.model('Reviews', restaurantSchema);