const mongoose = require('mongoose');

const supplierPartSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },

    part: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Part',
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    leadTimeDays: {
        type: Number,
        required: true
    }
});

const SupplierPart = mongoose.model('SupplierPart', supplierPartSchema);

module.exports = SupplierPart;