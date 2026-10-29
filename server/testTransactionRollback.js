require("dotenv").config();


const mongoose = require("mongoose");
const SupplierPart = require("./models/SupplierPart");
const SupplierPriceHistory = require("./models/SupplierPriceHistory");
const Supplier = require("./models/Supplier");

async function testRollback() {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB for rollback testing");

    const testSupplierPartId = "6adfe019977c64b1248a46a2";

    const supplierPart = await SupplierPart.findById(
        testSupplierPartId
    ).populate("supplier");

    if (!supplierPart) {
        console.log("Test supplier part not found");
    } else {
        console.log("Supplier:", supplierPart.supplier.name);
        console.log("Part number:", supplierPart.supplierPartNumber);
        console.log("Current price:", supplierPart.price);

       const historyCount = await SupplierPriceHistory.countDocuments({
            supplierPart: testSupplierPartId
    });

    console.log("History records before test:", historyCount);

    if(
        supplierPart.supplierPartNumber === "TEST-PH-001" &&
        supplierPart.supplier.name === "TEST ONLY - Price History" &&
        supplierPart.price === 15 &&
        historyCount === 1
    ) {
        try {
            await mongoose.connection.transaction(async (session) => {
                await SupplierPart.findByIdAndUpdate(
                     testSupplierPartId,
                    { price: 20 },
                    { session, runValidators: true}
                );
               
                await SupplierPriceHistory.create(
                    [{
                        supplierPart: testSupplierPartId,
                        oldPrice: 15,
                        newPrice: 20
                    }],
                    { session }
                );

                throw new Error("Intentional rollback test");
            });
        } catch (err) {
            console.log("Expected rollback:", err.message);
        }
    } else {
        console.log("Safety check failed; no changes attempted");
    }
}

    await mongoose.disconnect();

}

testRollback().catch(console.error); 