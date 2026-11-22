
const assert = require("node:assert/strict");
const extractAIUsage = require("./services/aiUsage");

// Test 1: Valid usage data
const valid = extractAIUsage({
    model: "gpt-4.1-mini",
    usage: {
        input_tokens: 500,
        output_tokens: 200,
        total_tokens: 700
    }
});

assert.equal(valid.inputTokens, 500);
assert.equal(valid.outputTokens, 200);
assert.equal(valid.totalTokens, 700);
console.log("PASS: Valid AI usage");

// Test 2: Missing usage data
const missing = extractAIUsage({
    model: "gpt-4.1-mini"
});

assert.equal(missing, null);
console.log("PASS: Missing usage rejected");

// Test 3: Invalid token data
const invalid = extractAIUsage({
    model: "gpt-4.1-mini",
    usage: {
        input_tokens: -10,
        output_tokens: 200,
        total_tokens: 190
    }
});

assert.equal(invalid, null);
console.log("PASS: Invalid usage rejected");

// Test 4: Zero tokens
const zero = extractAIUsage({
    model: "gpt-4.1-mini",
    usage: {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0
    }
});

assert.equal(zero.totalTokens, 0);
console.log("PASS: Zero usage accepted");

console.log("PASS: All AI usage tests");
