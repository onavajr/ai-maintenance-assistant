const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        default: null
    }
});

const Machine = mongoose.model("Machine", machineSchema);

module.exports = Machine;