
require("dotenv").config({ quiet: true });

const assert = require("node:assert/strict");
const { randomUUID, randomBytes } = require("node:crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Company = require("./models/Company");
const Machine = require("./models/Machine");
const User = require("./models/User");
const { hashPassword } = require("./services/passwordService");
const app = require("./index");

async function run() {
    let server;
    const temporaryUsers = [];
    let databaseVerified = false;

    try {
        if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
            throw new Error("Required environment settings missing");
        }

        const uri = new URL(process.env.MONGO_URI);
        uri.pathname = "/ai_maintenance_isolated_test";

        await mongoose.connect(uri.toString(), {
            autoIndex: false,
            autoCreate: false
        });

        if (
            mongoose.connection.db.databaseName !==
            "ai_maintenance_isolated_test"
        ) {
            throw new Error("Wrong database");
        }

        databaseVerified = true;
        console.log("PASS: Isolated database verified");

        const companies = await Company.find({
            name: { $in: ["Test Factory A", "Test Factory B"] },
            isActive: true
        });

        if (companies.length !== 2) {
            throw new Error("Expected test companies not found");
        }

        const companyA = companies.find(
            company => company.name === "Test Factory A"
        );

        const companyB = companies.find(
            company => company.name === "Test Factory B"
        );

        if (!companyA || !companyB) {
            throw new Error("Test company identification failed");
        }

        const machinesA = await Machine.find({
            companyId: companyA._id
        });

        const machinesB = await Machine.find({
            companyId: companyB._id
        });

        assert.deepEqual(
            machinesA.map(machine => machine.name).sort(),
            ["CNC Machine", "Conveyor"].sort()
        );

        assert.deepEqual(
            machinesB.map(machine => machine.name).sort(),
            ["Packaging Robot"]
        );

        const passwordHash = await hashPassword(
            randomBytes(32).toString("hex")
        );

        for (const company of [companyA, companyB]) {
            const user = await User.create({
                name: "Temporary Isolation Test",
                email: `isolation-${randomUUID()}@example.invalid`,
                passwordHash,
                role: "technician",
                companyId: company._id
            });

            temporaryUsers.push(user);
        }

        function createToken(user) {
            return jwt.sign(
                { sub: user._id.toString() },
                process.env.JWT_SECRET,
                {
                    algorithm: "HS256",
                    issuer: "ai-maintenance-assistant",
                    audience: "ai-maintenance-assistant-users",
                    expiresIn: "5m"
                }
            );
        }

        server = app.listen(0, "127.0.0.1");

        await new Promise((resolve, reject) => {
            server.once("listening", resolve);
            server.once("error", reject);
        });

        const baseURL =
            `http://127.0.0.1:${server.address().port}`;

        async function request(path, token) {
            return fetch(`${baseURL}${path}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        const tokenA = createToken(temporaryUsers[0]);
        const tokenB = createToken(temporaryUsers[1]);

        const listA = await request("/api/machines", tokenA);
        assert.equal(listA.status, 200);

        const resultA = await listA.json();
        assert.deepEqual(
            resultA.map(machine => machine.name).sort(),
            ["CNC Machine", "Conveyor"].sort()
        );
        console.log("PASS: Company A sees its 2 machines");

        const listB = await request("/api/machines", tokenB);
        assert.equal(listB.status, 200);

        const resultB = await listB.json();
        assert.deepEqual(
            resultB.map(machine => machine.name),
            ["Packaging Robot"]
        );
        console.log("PASS: Company B sees its 1 machine");

        const countA = await request("/api/machines/count", tokenA);
        assert.equal(countA.status, 200);
        assert.equal((await countA.json()).count, 2);

        const countB = await request("/api/machines/count", tokenB);
        assert.equal(countB.status, 200);
        assert.equal((await countB.json()).count, 1);

        console.log("PASS: Company machine counts isolated");

        const blockedA = await request(
            `/api/machines/${machinesB[0]._id}`,
            tokenA
        );

        assert.equal(blockedA.status, 404);
        console.log("PASS: Company A cannot view Company B machine");

        const blockedB = await request(
            `/api/machines/${machinesA[0]._id}`,
            tokenB
        );

        assert.equal(blockedB.status, 404);
        console.log("PASS: Company B cannot view Company A machine");

        console.log("PASS: All machine read-isolation tests");

    } finally {
        if (server?.listening) {
            await new Promise(resolve => server.close(resolve));
            console.log("PASS: Test server closed");
        }

        if (databaseVerified && temporaryUsers.length > 0) {
            await User.deleteMany({
                _id: {
                    $in: temporaryUsers.map(user => user._id)
                }
            });

            console.log("PASS: Temporary test employees removed");
        }

        await mongoose.disconnect();
    }
}

run().catch(error => {
    console.error("FAIL:", error.message);
    process.exitCode = 1;
});
