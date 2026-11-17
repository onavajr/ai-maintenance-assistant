const assert = require("node:assert/strict");

const {
    hashPassword,
    verifyPassword
} = require("./services/passwordService.js"

);

async function testPasswordService() {
    const password = "ExampleTestPassword2026!";
    const hash = await hashPassword(password);

    assert.notEqual(hash, password);
    assert.ok(hash.startsWith("$argon2id$"));

    assert.equal(await verifyPassword(hash, password), true);
    assert.equal(await verifyPassword(hash, "WrongPassword"), false);

    console.log("PASS: Password security tests");
}

testPasswordService().catch((err) => {
    console.error("FAIL:", err.message);
    process.exitCode = 1;
});