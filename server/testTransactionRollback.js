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

    }
    
    await mongoose.disconnect();

}

testRollback().catch(console.error); 