
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
    let databaseVerified = false;
    const temporaryUserIds = [];
    const runId = randomUUID();

    const machineAName = `Isolation A ${runId}`;
    const machineBName = `Isolation B ${runId}`;
    const blockedName = `Blocked ${runId}`;

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

        assert.equal(companies.length, 2);

        const companyA = companies.find(
            company => company.name === "Test Factory A"
        );

        const companyB = companies.find(
            company => company.name === "Test Factory B"
        );

        assert.ok(companyA && companyB);

        const passwordHash = await hashPassword(
            randomBytes(32).toString("hex")
        );

        async function makeUser(role) {
            const user = await User.create({
                name: "Temporary Write Test",
                email: `write-${randomUUID()}@example.invalid`,
                passwordHash,
                role,
                companyId: companyA._id
            });

            temporaryUserIds.push(user._id);

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

        const managerToken = await makeUser("manager");
        const adminToken = await makeUser("admin");
        const technicianToken = await makeUser("technician");

        const machineB = await Machine.create({
            name: machineBName,
            companyId: companyB._id
        });

        server = app.listen(0, "127.0.0.1");

        await new Promise((resolve, reject) => {
            server.once("listening", resolve);
            server.once("error", reject);
        });

        const baseURL =
            `http://127.0.0.1:${server.address().port}`;

        async function request(method, path, token, body) {
            return fetch(`${baseURL}${path}`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                ...(body ? { body: JSON.stringify(body) } : {})
            });
        }

        // A manager must not choose another company's ID.
        const createResponse = await request(
            "POST",
            "/api/machines",
            managerToken,
            {
                name: machineAName,
                companyId: companyB._id.toString()
            }
        );

        assert.equal(createResponse.status, 201);

        const createdMachine = await createResponse.json();

        assert.equal(
            createdMachine.companyId,
            companyA._id.toString()
        );

        console.log("PASS: Machine creation uses verified company");

        // A technician cannot create machines.
        const technicianResponse = await request(
            "POST",
            "/api/machines",
            technicianToken,
            { name: blockedName }
        );

        assert.equal(technicianResponse.status, 403);

        assert.equal(
            await Machine.countDocuments({ name: blockedName }),
            0
        );

        console.log("PASS: Technician creation blocked");

        // Company A must not update Company B's machine.
        const updateResponse = await request(
            "PATCH",
            `/api/machines/${machineB._id}`,
            managerToken,
            { name: "Unauthorized change" }
        );

        assert.equal(updateResponse.status, 404);

        const unchangedMachine = await Machine.findById(
            machineB._id
        );

        assert.equal(unchangedMachine.name, machineBName);

        console.log("PASS: Cross-company update blocked");

        // Company A must not delete Company B's machine.
        const deleteResponse = await request(
            "DELETE",
            `/api/machines/${machineB._id}`,
            adminToken
        );

        assert.equal(deleteResponse.status, 404);

        assert.ok(await Machine.findById(machineB._id));

        console.log("PASS: Cross-company deletion blocked");

        // Authorized operations must still work.
        const ownUpdate = await request(
            "PATCH",
            `/api/machines/${createdMachine._id}`,
            managerToken,
            { name: machineAName + " updated" }
        );

        assert.equal(ownUpdate.status, 200);

        const ownDelete = await request(
            "DELETE",
            `/api/machines/${createdMachine._id}`,
            adminToken
        );

        assert.equal(ownDelete.status, 200);

        console.log("PASS: Authorized update and delete");
        console.log("PASS: All machine write-isolation tests");

    } finally {
        if (server?.listening) {
            await new Promise(resolve => server.close(resolve));
            console.log("PASS: Test server closed");
        }

        if (databaseVerified) {
            await Machine.deleteMany({
                name: {
                    $in: [
                        machineAName,
                        machineAName + " updated",
                        machineBName,
                        blockedName
                    ]
                }
            });

            if (temporaryUserIds.length > 0) {
                await User.deleteMany({
                    _id: { $in: temporaryUserIds }
                });
            }

            console.log("PASS: Disposable test records cleaned");
        }

        await mongoose.disconnect();
    }
}

run().catch(error => {
    console.error("FAIL:", error.message);
    process.exitCode = 1;
});
