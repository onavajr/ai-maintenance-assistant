require("dotenv").config();

const mongoose = require("mongoose");
const InventoryBalance = require("./models/InventoryBalance");
const InventoryTransaction = require("./models/InventoryTransaction");

const partId = process.argv[2]; // Replace with the actual partId you want to test  

async function testRollback() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const beforeBalance = await InventoryBalance.findOne({
            part: partId
        });

        if (!beforeBalance){
            throw new Error("Test inventory balance not found");
        }

        const beforeCount = await InventoryTransaction.countDocuments({
            part: partId
        });

        try {
            await mongoose.connection.transaction(async (session) => {
                const updatedBalance = await InventoryBalance.findOneAndUpdate(
                    {
                        part: partId,
                        quantityOnHand: { $gte: 1 }
                    },
                    { $inc: { quantityOnHand: -1 } },
                    { returnDocument: "after", session }
                );

                if (!updatedBalance) {
                    throw new Error("Not enough test inventory");
                }

                await InventoryTransaction.create(
                    [{
                        part: partId,
                        type: "OUT",
                        quantity: 1,
                        reason: "Intentional rollback test"
                    }],
                    { session }
                );

                throw new Error("TEST_ROLLBACK");
            });
            
            throw new Error("Rollback was not triggered");

            } catch (err) {
                if (err.message !== "TEST_ROLLBACK") {
                    throw err;
                }

                console.log("Expected rollback triggered");
            }

            const afterBalance = await InventoryBalance.findOne({
                part: partId
            });

            const afterCount = await InventoryTransaction.countDocuments({
                part: partId
            });

            console.log("Balance before:", beforeBalance.quantityOnHand);
            console.log("Balance after:", afterBalance?.quantityOnHand);
            console.log("History before:", beforeCount);
            console.log("History after:", afterCount);

            if(
                beforeBalance.quantityOnHand !== afterBalance?.quantityOnHand ||
                beforeCount !== afterCount
            ){
                throw new Error("Rollback verification failed");
            }

            console.log("PASS: Both database changes rolled back");

            } catch (err) {
                console.error("Error during rollback test:", err.message);
                process.exitCode = 1;
            } finally {
                await mongoose.disconnect();
            }
        }

testRollback();
