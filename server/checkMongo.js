require("dotenv").config();

const mongoose = require("mongoose");

async function checkMongo() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const info = await mongoose.connection.db.admin().command({
            hello: 1
        });

        const supportedTopology = Boolean(info.setName || info.msg === "isdbgrid");

        console.log("Transaction-capable topology:", supportedTopology);

    } catch (err) {
        console.error("Check failed:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkMongo();