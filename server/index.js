const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send("AI assistance backend running");
})

const machines = [{ id: 1, name: "Robot arm A"},
        { id: 2, name: "Conveyor line 1"},];

app.get("/api/machines", (req, res) => {
    res.json(machines);
})

app.get("/api/machines/:id", (req, res) => {
    const machineId = Number(req.params.id);

    const machine = machines.find((machine) => machine.id === machineId);
    
    res.json(machine);
});

app.listen(5000, () => {
    console.log("server running on port 5000");
});