const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
    part: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Part",
        required: true
    },

    type: {
        type: String,
        enum: ["IN", "OUT"],
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    notes: {
        type: String
    },

    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    
},{
    timestamps: true
});

const InventoryTransaction = mongoose.model(
    "InventoryTransaction",
    inventoryTransactionSchema
);

module.exports = InventoryTransaction;