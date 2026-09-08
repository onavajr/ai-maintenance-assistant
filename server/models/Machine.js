const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Machine = mongoose.model("Machine", machineSchema);

module.exports = Machine;