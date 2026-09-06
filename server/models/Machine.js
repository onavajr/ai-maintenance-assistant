const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Machine = mongooose.model("Machine", machineSchema);

module.exports = Machine;