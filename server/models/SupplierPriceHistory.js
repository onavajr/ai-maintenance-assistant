const mongoose = require("mongoose");

const supplierPriceHistorySchema = new mongoose.Schema({
    supplierPart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupplierPart",
        required: true
    },

    oldPrice: {
        type: number,
        required: true,
        min: 0
    }
});
