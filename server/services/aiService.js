const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async  function getAIResponse(message) {
        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input: message
        });
        return response.output_text;
    }

module.exports = getAIResponse;