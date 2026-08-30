const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send("AI assistance backend running");
})

app.get("/api/machines", (req, res) => {
    res.send("Machine data will go here");
})

app.listen(5000, () => {
    console.log("server running on port 5000");
});