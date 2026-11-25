
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const companyA = new mongoose.Types.ObjectId();
const companyB = new mongoose.Types.ObjectId();

const machines = [
    { name: "CNC Machine", companyId: companyA },
    { name: "Conveyor", companyId: companyA },
    { name: "Packaging Robot", companyId: companyB },
    { name: "Legacy Machine", companyId: null }
];

// Simulate a company-scoped machine query.
function findCompanyMachines(companyId) {
    if (
        typeof companyId !== "string" ||
        !mongoose.isValidObjectId(companyId)
    ) {
        throw new Error("Valid company assignment required");
    }

    return machines.filter(
        machine =>
            machine.companyId?.toString() === companyId
    );
}

const resultA = findCompanyMachines(companyA.toString());

assert.equal(resultA.length, 2);
assert.equal(resultA[0].name, "CNC Machine");
assert.equal(resultA[1].name, "Conveyor");
console.log("PASS: Company A sees only its machines");

const resultB = findCompanyMachines(companyB.toString());

assert.equal(resultB.length, 1);
assert.equal(resultB[0].name, "Packaging Robot");
console.log("PASS: Company B sees only its machines");

assert.throws(() => findCompanyMachines(null));
console.log("PASS: Missing company rejected");

console.log("PASS: Machine isolation simulation");
