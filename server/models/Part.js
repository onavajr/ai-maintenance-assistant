const mongoose = require("mongoose");

const partSchema = new mongoose.Schema({
    partNumber: {
        type: String,
        required: true,
        unique: true
    },
    
    name: {
        type: String,
        required: true
    },

    manufacturer: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    unitOfMeasure: {
        type: String,
        required: true
    },

    minimumStock: {
        type: Number,
        default: 0
    },

    reorderPoint: {
        type: Number,
        default: 0
    },

    lastPurchasePrice: {
        type: Number,
        default: 0
    },

    averageCost: {
        type: Number,
        default: 0
    },

    active: {
        type: Boolean,
        default: true
    }
    }, {

        timestamps: true

});

const Part = mongoose.model("Part", partSchema);

module.exports = Part;