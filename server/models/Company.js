
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 120
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
