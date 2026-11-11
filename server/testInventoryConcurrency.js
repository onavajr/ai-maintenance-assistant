const partId = "6af22876d8f9b1e36e33763e";

const apiUrl = "http://localhost:5000/api/inventory-transactions";

const requestBody = {
    part: partId,
    type: "OUT",
    quantity: 5,
    reason: "Concurrency test"
};

async function sendRequest() {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    return {
        status: response.status,
        data: await response.json()
    };
}

async function testConcurrency() {
    try {
        const beforeResponse = await fetch(
            `http://localhost:5000/api/inventory-balances/part/${partId}`
        );

        if (!beforeResponse.ok) {
            throw new Error("Cannot read starting inventory");
        }

        const beforeBalance = await beforeResponse.json();

        if (beforeBalance.quantityOnHand !== 7) {
            throw new Error("Test requires exactly 7 bearings");
        }

        console.log("Starting inventory:", beforeBalance.quantityOnHand);

        const results = await Promise.all([
            sendRequest(),
            sendRequest()
        ]);

        console.log("Technician A:", results[0].status, results[0].data);
        console.log("Technician B:", results[1].status, results[1].data);

        const successCount = results.filter(
    result => result.status === 201
).length;

const rejectedCount = results.filter(
    result => result.status === 400
).length;

if (successCount !== 1 || rejectedCount !== 1) {
    throw new Error("Unexpected concurrency results");
}

        const successCount = results.filter(
            result => result.status === 201
        ).length;

        const rejectedCount = results.filter(
            result => result.status === 400
        ).length;

        if (successCount !== 1 || rejectedCount !== 1) {
            throw new Error("Unexpected concurrency results");
        }

        if (afterBalance.quantityOnHand !== 2) {
            throw new Error("Incorrect final inventory");
        }

        console.log("PASS: Concurrency test");

        const afterResponse = await fetch(
            `http://localhost:5000/api/inventory-balances/part/${partId}`
        );

        if (!afterResponse.ok) {
            throw new Error("Cannot read final inventory");
        }

        const afterBalance = await afterResponse.json();

        console.log("Remaining inventory:", afterBalance.quantityOnHand);

    } catch (err) {
        console.error("Test failed:", err.message);
        process.exitCode = 1;
    }
}

testConcurrency();