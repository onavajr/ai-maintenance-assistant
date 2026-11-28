const mongoose = require('mongoose');

const inventoryBalanceSchema = new mongoose.Schema({
    part: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Part",
       required: true,
       unique: true
    },


    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        default: null
    },


    quantityOnHand: {
        type: Number,
        default: 0,
        min: 0
    }
},
    {
        timestamps: true
});

const InventoryBalance = mongoose.model(
    "InventoryBalance",
    inventoryBalanceSchema
);

module.exports = InventoryBalance;