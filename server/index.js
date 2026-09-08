require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Machine = require('./models/Machine');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("AI assistance backend running");
})

const machines = [{ id: 1, name: "Robot arm A"},
        { id: 2, name: "Conveyor line 1"},];

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


app.get("/api/machines/:id", (req, res) => {
    const machineId = Number(req.params.id);

    const machine = machines.find((machine) => machine.id === machineId);

    if(!machine) {
        return res.status(404).json({ message: "Machine not found" });
    }
    
    res.json(machine);
});

app.delete("/api/machines/:id", (req, res) => {
    const machineId = Number(req.params.id);

    const machineIndex = machines.findIndex(
        (machine) => machine.id === machineId
    );

    if (machineIndex === -1) {
        return res.status(404).json({
            message: "Machine not found"
        });
    }

    const deletedMachine = machines.splice(machineIndex, 1);

    res.json(deletedMachine[0]);
});

app.patch("/api/machines/:id",(req, res) => {
    const machineId = Number(req.params.id);

    const machine = machines.find((machine) => machine.id === machineId);

    if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
    }

    if (req.body.name) {
        machine.name = req.body.name;
    }

    res.json(machine);
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