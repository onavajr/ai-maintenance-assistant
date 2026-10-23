require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Machine = require('./models/Machine');
const getAIResponse = require('./services/aiService');
const Part = require('./models/Part');
const InventoryTransaction = require('./models/InventoryTransaction');
const InventoryBalance = require('./models/InventoryBalance');
const Supplier = require('./models/Supplier');
const SupplierPart = require('./models/SupplierPart');
const SupplierPriceHistory = require("./models/SupplierPriceHistory");

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("AI assistance backend running");
})

app.get("/api/machines", async(req, res) => {
    try {
        const machines = await Machine.find();

        res.json(machines);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving machines", error: err.message });
    }
});


app.post("/api/machines", async(req, res) => {
    try {
        if(!req.body.name) {
        return res.status(400).json({
            message: "Machine name is required"
        });
    }
        const newMachine = await Machine.create({
            name: req.body.name
        });
    
        res.status(201).json(newMachine);
    } catch (err) {
        res.status(500).json({
        message: "Error creating machine",
        error: err.message
        });
    }
});

app.get("/api/machines/count", async (req, res) => {
    try {
        const count = await Machine.countDocuments();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ 
            message: "Error counting machines",
            error: err.message
        });
    }   
});


app.get("/api/machines/:id", async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);

        if (!machine) {
            return res.status(404).json({ message: 
                "Machine not found"
            });
        }

        res.json(machine);

    } catch (err) {
        res.status(500).json({ message: 
            "Error retrieving machine", error: err.message
        });
    }
});


app.delete("/api/machines/:id", async (req, res) => {
    try {
        const machine = await Machine.findByIdAndDelete(req.params.id);
        if (!machine) {
            return res.status(404).json({ message: "Machine not found" });
        }
        res.json(machine);
    } catch (err) {
        res.status(500).json({ message: "Error deleting machine", error: err.message });
    }
});


app.patch("/api/machines/:id", async (req, res) => {
    try {
        const machine = await Machine.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );

        if (!machine) {
            return res.status(404).json({
                message: "Machine not found"
            });
        }

        res.json(machine);

    } catch (err) {
        res.status(500).json({
            message: "Error updating machine",
            error: err.message
        });
    }
});

app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const reply = await getAIResponse(message);

        res.json({
            reply: reply
        });
    } catch (err) {
        res.status(500).json({
            message: "Error processing chat",
            error: err.message
        });
    }

});

app.post("/api/parts", async (req, res) => {
    try {
        if(
            !req.body.partNumber ||
            !req.body.name ||
            !req.body.manufacturer ||
            !req.body.category ||
            !req.body.unitOfMeasure
        ){
            return res.status(400).json({
                message: "Required parts information is missing"
            });
        }

        const newPart = await Part.create({
            partNumber: req.body.partNumber,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            category: req.body.category,
            description: req.body.description,
            unitOfMeasure: req.body.unitOfMeasure,
            minimumStock: req.body.minimumStock,
            reorderPoint: req.body.reorderPoint,
            lastPurchasePrice: req.body.lastPurchasePrice,
            averageCost: req.body.averageCost
        });

          res.status(201).json(newPart);

    } catch (err) {
        res.status(500).json({
            message: "Error creating part",
            error: err.message
        });
    }
});

app.get("/api/parts", async (req, res) => {
    try {
        const parts = await Part.find();

        res.json(parts);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving parts",
            error: err.message
        });
    }
});

app.get("/api/parts/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message: "Invalid part ID, please enter the correct ID"
            });
        }
        const part = await Part.findById(req.params.id);

        if (!part) {
            return res.status(404).json({
                message: "Part not found"
            });
        }

        res.json(part);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving part",
            error: err.message
        });
    }
});

app.patch("/api/parts/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message: "Invalid part ID, please enter the correct ID"
            });
        }

        const part = await Part.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!part) {
            return res.status(404).json({
                message: "Part not found"
            });
        }

        res.json(part);
    } catch (err) {
        res.status(500).json({
            message: "Error updating part",
            error: err.message
        });
    }
});

app.delete("/api/parts/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message: "Invalid part ID, please enter the correct ID"
            });
        }

        const part = await Part.findByIdAndDelete(req.params.id);

        if (!part) {
            return res.status(404).json({
                message: "Part not found"
            });
        }

        res.json({
            message: "Part deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error deleting part",
            error: err.message
        });
    }
});

app.post("/api/inventory-transactions", async (req, res) => {
    try {
        if (
            !req.body.part ||
            !req.body.type ||
            !req.body.quantity ||
            !req.body.reason
        ) {
            return res.status(400).json({
                message: "Required inventory transaction information is missing"
            });
        }

        let balance = await InventoryBalance.findOne({
            part: req.body.part
        });

        if(!balance){
            balance = await InventoryBalance.create({
                part: req.body.part,
                quantityOnHand: 0
            });
        };

        if (req.body.type === "OUT" && balance.quantityOnHand < req.body.quantity) {
        return res.status(400).json({
            message: "Insufficient inventory"
        });
    }

    const newTransaction = await InventoryTransaction.create({
            part: req.body.part,
            type: req.body.type,
            quantity: req.body.quantity,
            reason: req.body.reason,
            notes: req.body.notes
        });

        if(req.body.type === "IN"){
            balance.quantityOnHand += req.body.quantity;
        }

        if(req.body.type === "OUT"){
            balance.quantityOnHand -= req.body.quantity;
        }

        await balance.save();

        res.status(201).json(newTransaction);

    } catch (err) {
        res.status(500).json({
            message: "Error creating inventory transaction",
            error: err.message
        });
    }
});

app.get("/api/inventory-transactions", async (req, res) => {
    try {
        const transactions = await InventoryTransaction.find();

        res.json(transactions);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving inventory transaction",
            error: err.message
        });
    }
});

app.get("/api/inventory-transactions/part/:partId", async (req, res) => {
    try {
        const partId = req.params.partId;

        if (!mongoose.Types.ObjectId.isValid(partId)) {
            return res.status(400).json({
                message: "Invalid part ID"
            });
        }

        const transactionHistory = await InventoryTransaction.find({
            part: partId
        });

        res.json(transactionHistory);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving inventory transaction history",
            error: err.message
        });
    }
});

app.get("/api/inventory-transactions/:id", async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message:"Invalid inventory transaction ID"
            });
        }

        const transaction = await InventoryTransaction.findById(req.params.id);

        if(!transaction){
            return res.status(404).json({
                message: "Inventory transaction not found"
            });
        }

        res.json(transaction);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving inventory transaction",
            error: err.message
        });
    }
});

app.get("/api/inventory-balances", async(req, res) => {
    try{
        const balances = await InventoryBalance.find();

        res.json(balances);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving inventory balances",
            error: err.message
        });
    }
});

app.get("/api/inventory-balances/part/:partId", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.partId)) {
            return res.status(400).json({
                message: "Invalid part ID"
            });
        }

        const balance = await InventoryBalance.findOne({
            part: req.params.partId
        });

        if(!balance) {
            return res.status(404).json({
                message: "Inventory balance not found"
            });
        }

        res.json(balance);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving inventory balance",
            error: err.message
        });
    }
});

app.post("/api/inventory-balances", async (req, res) => {
    try {
        if (!req.body.part || req.body.quantityOnHand === undefined){
            return res.status(400).json({
                message: "Required inventory balance information is missing"
            });
        }

        const newBalance = await InventoryBalance.create({
            part: req.body.part,
            quantityOnHand: req.body.quantityOnHand,
        });

        res.status(201).json(newBalance);

    } catch (err) {
        res.status(500).json({
            message: "Error creating inventory balance",
            error: err.message
        });
    }
});

app.post("/api/suppliers", async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({
                message: "Supplier name is required"
            });
        }

        const suppliers = await Supplier.create({
            name: req.body.name,
            contactName: req.body.contactName,
            email: req.body.email,
            phone: req.body.phone,
            website: req.body.website,
        });

        res.status(201).json(suppliers);

    } catch (err) {
        res.status(500).json({
            message: "Error creating supplier",
            error: err.message
        });
    }
});

app.get("/api/suppliers", async (req, res) => {
    try {
        const suppliers = await Supplier.find();

        res.status(200).json(suppliers);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving suppliers",
            error: err.message
        });
    }
});

app.get("/api/suppliers/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid supplier ID"
            });
        }

        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        res.json(supplier);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving supplier",
            error: err.message
        });
    }

});

app.patch("/api/suppliers/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message: "Invalid supplier ID"
            });
        }

        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!supplier) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        res.json(supplier);

    } catch (err) {
        res.status(500).json({
            message: "Error updating supplier",
            error: err.message
        });
    }
});

app.delete("/api/suppliers/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message: "Invalid supplier ID"
            });
        }
        
        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }
        
        res.json({
            message: "Supplier deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "Error deleting supplier",
            error: err.message
        });
    }
});

app.post("/api/supplier-parts" , async (req, res) => {
    try {
        if (
            !req.body.supplier ||
            !req.body.part ||
            req.body.price === undefined ||
            req.body.leadTimeDays === undefined
        ){
            return res.status(400).json({
                message: "Required supplier part information is missing"
            });
        }

        if(!mongoose.Types.ObjectId.isValid(req.body.supplier) ||
        !mongoose.Types.ObjectId.isValid(req.body.part)
    ) {
        return res.status(400).json({
            message: "Invalid supplier or part ID"
        });
    }
        const supplier = await Supplier.findById(req.body.supplier);

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        const part = await Part.findById(req.body.part);

        if (!part) {
            return res.status(404).json({
                message: "Part not found"
            });
        }

        const newSupplierPart = await SupplierPart.create({
            supplier: req.body.supplier,
            part: req.body.part,
            supplierPartNumber: req.body.supplierPartNumber,
            price: req.body.price,
            leadTimeDays: req.body.leadTimeDays,
            preferred: req.body.preferred,
            active: req.body.active
        });

        res.status(201).json(newSupplierPart);

    } catch (err) {
        res.status(500).json({
            message: "Error creating supplier part",
            error: err.message
        });
    }
});

app.get("/api/supplier-parts", async (req, res) => {
    try {
        const supplierParts = await SupplierPart.find()
        .populate("supplier")
        .populate("part");

        res.json(supplierParts);
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving supplier parts",
            error: err.message
        });
    }
});

app.get("/api/supplier-parts/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message: "Invalid supplier part ID"
            });
        }
        
        const supplierPart = await SupplierPart.findById(req.params.id)
        .populate("supplier")
        .populate("part");

        if (!supplierPart) {
            return res.status(404).json({
                message: "Supplier part not found"
            });
        }

        return res.json(supplierPart);

    } catch (err) {
        res.status(500).json({
            message: "Error retrieving supplier part",
            error: err.message
        });
    }
});

app.patch("/api/supplier-parts/:id", async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                message: "Invalid supplier part ID"
            });
        }

        if (
            req.body.price !== undefined &&
            (
                typeof req.body.price !== "number" ||
                !Number.isFinite(req.body.price) ||
                req.body.price < 0
            )
        ) {
            return res.status(400).json({
                message: "Supplier price must be a non-negative number"
            });
        }

        if (
            req.body.leadTimeDays !== undefined &&
            (
                !Number.isInteger(req.body.leadTimeDays) ||
                req.body.leadTimeDays < 0
            )
        ) {
            return res.status(400).json(
            {message: "Lead time must be a non-negative whole number"}
            );
        }

        if(
            req.body.preferred !== undefined &&
            typeof req.body.preferred !== "boolean"
        ){
            return res.status(400).json({
                message: "Preferred must be true or false"
            });
        }

         if(
            req.body.active !== undefined &&
            typeof req.body.active !== "boolean"
        ){
            return res.status(400).json({
                message: "Active must be true or false"
            });
        }

        const updates = {};

        if (req.body.price !== undefined) {
            updates.price = req.body.price;
        }

        if (req.body.leadTimeDays !== undefined) {
            updates.leadTimeDays = req.body.leadTimeDays;
        }

        if (req.body.preferred !== undefined) {
            updates.preferred = req.body.preferred;
        }

        if (req.body.active !== undefined) {
            updates.active = req.body.active;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }

        const existingSupplierPart = await SupplierPart.findById(
        req.params.id
        );

        if(!existingSupplierPart) {
            return res.status(404).json({
                message: "Supplier part not found"
            });
        }

        const priceChanged =
        req.body.price !== undefined &&
        req.body.price !== existingSupplierPart.price;

        if(priceChanged){
            const historyData = {
                supplierPart: existingSupplierPart._id,
                oldprice: existingSupplierPart.price,
                newPrice: req.body.price
            };
        }

        const supplierPart = await SupplierPart.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!supplierPart) {
            return res.status(404).json({
                message: "Supplier part not found"
            });
        }

        res.json(supplierPart);

    } catch (err) {
        res.status(500).json({
            message: "Error updating supplier part",
            error: err.message
        });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Connection error:", err);
    })

app.listen(5000, () => {
    console.log("server running on port 5000");
});