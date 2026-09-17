require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Machine = require('./models/Machine');
const getAIResponse = require('./services/aiService');
const Part = require('./models/Part');


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