const mongoose = require("mongoose");

const supplierPriceHistorySchema = new mongoose.Schema({
    supplierPart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupplierPart",
        required: true
    },

    oldPrice: {
        type: Number,
        required: true,
        min: 0
    },

    newPrice: {
        type: Number,
        required: true,
        min: 0
    },
       
},{
     timestamps: true
});

const SupplierPriceHistory = mongoose.model(
    "SupplierPriceHistory",
    supplierPriceHistorySchema
);

module.exports = SupplierPriceHistory;
