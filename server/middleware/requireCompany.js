
const mongoose = require("mongoose");
const Company = require("../models/Company");

async function requireCompany(req, res, next) {
    const companyId = req.user?.companyId;

    if (
        typeof companyId !== "string" ||
        !mongoose.isValidObjectId(companyId)
    ) {
        return res.status(403).json({
            message: "Valid company assignment required"
        });
    }

    try {
        const company = await Company.exists({
            _id: companyId,
            isActive: true
        });

        if (!company) {
            return res.status(403).json({
                message: "Company access denied"
            });
        }

        return next();

    } catch (err) {
        console.error(
            "Company verification error:",
            err.message
        );

        return res.status(503).json({
            message: "Company verification unavailable"
        });
    }
}

module.exports = requireCompany;
