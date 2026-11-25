
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const Company = require("./models/Company");
const requireCompany = require("./middleware/requireCompany");

const companyId = new mongoose.Types.ObjectId().toString();

const originalExists = Company.exists;

async function runTest(name, user, mockResult, expectedStatus, expectedNext) {
    let databaseChecked = false;

    Company.exists = async (filter) => {
        databaseChecked = true;

        assert.equal(filter._id, companyId);
        assert.equal(filter.isActive, true);

        if (mockResult instanceof Error) {
            throw mockResult;
        }

        return mockResult;
    };

    const req = { user };
    let statusCode = 200;
    let nextCalled = false;

    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json() {
            return this;
        }
    };

    await requireCompany(req, res, () => {
        nextCalled = true;
    });

    assert.equal(statusCode, expectedStatus);
    assert.equal(nextCalled, expectedNext);

    console.log(`PASS: ${name}`);
}

async function main() {
    try {
        await runTest(
            "Active company allowed",
            { companyId },
            { _id: companyId },
            200,
            true
        );

        await runTest(
            "Missing company rejected",
            { companyId: null },
            null,
            403,
            false
        );

        await runTest(
            "Invalid company ID rejected",
            { companyId: "invalid" },
            null,
            403,
            false
        );

        await runTest(
            "Inactive company rejected",
            { companyId },
            null,
            403,
            false
        );

        await runTest(
            "Database failure handled",
            { companyId },
            new Error("Simulated database failure"),
            503,
            false
        );

        console.log("PASS: All company security tests");
    } finally {
        Company.exists = originalExists;
    }
}

main().catch(error => {
    console.error("FAIL:", error.message);
    process.exitCode = 1;
});
