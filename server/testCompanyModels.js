
const assert = require("node:assert/strict");

const Company = require("./models/Company");
const User = require("./models/User");

// Create a fictional company in memory.
const company = new Company({
    name: "Factory A"
});

assert.equal(company.validateSync(), undefined);
console.log("PASS: Company model validated");

// Create a fictional technician in memory.
const technician = new User({
    name: "Test Technician",
    email: "test@example.invalid",
    passwordHash: "test-only-placeholder",
    role: "technician",
    companyId: company._id
});

assert.equal(technician.validateSync(), undefined);

assert.equal(
    technician.companyId.toString(),
    company._id.toString()
);

console.log("PASS: Technician belongs to Company A");

// Simulate an existing employee without a company.
const existingUser = new User({
    name: "Existing Technician",
    email: "existing@example.invalid",
    passwordHash: "test-only-placeholder",
    role: "technician"
});

assert.equal(existingUser.validateSync(), undefined);
assert.equal(existingUser.companyId, null);

console.log("PASS: Existing user remains compatible");

console.log("PASS: All company model tests");
