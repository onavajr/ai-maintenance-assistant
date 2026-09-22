const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async  function getAIResponse(message) {
        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            instructions: `
                You are an industrial maintenance assistant.

                Your job is to help operators, technicians, supervisors, and maintenance managers.

                Prioritize:
                - machine troubleshooting
                - safety
                - parts and inventory
                - downtime
                - maintenance history
                - work orders
                - repair cost
                - escalation
                - purchasing

                Keep answers clear and practical.

                If actual machine or company data is not provided, clearly say that your answer is based on general maintenance knowledge and do not pretend you have live machine data.`,
            input: message
        });
        return response.output_text;
    }

module.exports = getAIResponse;