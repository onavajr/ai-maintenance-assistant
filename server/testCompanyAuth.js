
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./models/User");
const requireAuth = require("./middleware/requireAuth");

process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");

const userId = new mongoose.Types.ObjectId();
const companyId = new mongoose.Types.ObjectId();

const token = jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId.toString(),
    algorithm: "HS256",
    expiresIn: "15m",
    issuer: "ai-maintenance-assistant",
    audience: "ai-maintenance-assistant-users"
});

async function testCompanyAuth(assignedCompanyId) {
    User.findById = async () => ({
        _id: userId,
        role: "technician",
        isActive: true,
        companyId: assignedCompanyId
    });

    const req = {
        headers: {
            authorization: `Bearer ${token}`
        }
    };

    let nextCalled = false;

    const res = {
        status(code) {
            throw new Error(`Unexpected HTTP ${code}`);
        }
    };

    await requireAuth(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, userId.toString());
    assert.equal(req.user.role, "technician");

    return req.user.companyId;
}

async function runTests() {
    const assigned = await testCompanyAuth(companyId);

    assert.equal(assigned, companyId.toString());
    console.log("PASS: Assigned company verified");

    const unassigned = await testCompanyAuth(null);

    assert.equal(unassigned, null);
    console.log("PASS: Unassigned user remains compatible");

    console.log("PASS: Company authentication tests");
}

runTests().catch(error => {
    console.error("FAIL:", error.message);
    process.exitCode = 1;
});
