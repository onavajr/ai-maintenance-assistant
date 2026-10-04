const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    contactName: {
        type: String
    },

    email: {
        type: String
    },

    phone: {
        type: String
    },

    website: {
        type: String
    },

    active: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
