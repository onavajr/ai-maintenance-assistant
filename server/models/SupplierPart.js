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

    supplierPartNumber: {
        type: String
    },

    price: {
        type: Number,
        required: true
    },

    leadTimeDays: {
        type: Number,
        required: true
    },

    preferred: {
        type: Boolean,
        default: false
    },

    active: {
        type: Boolean,
        default: true
    },
    
},{
    timestamps: true
});

const SupplierPart = mongoose.model('SupplierPart', supplierPartSchema);

module.exports = SupplierPart;