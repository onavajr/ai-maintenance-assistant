function extractAIUsage(response) {
    const usage = response?.usage;

    if (
        !usage ||
        !Number.isSafeInteger(usage.input_tokens) ||
        usage.input_tokens < 0 ||
        !Number.isSafeInteger(usage.output_tokens) ||
        usage.output_tokens < 0 ||
        !Number.isSafeInteger(usage.total_tokens) ||
        usage.total_tokens < 0
    ){
        return null;
    }

    return {
        model: response.model ?? null,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.total_tokens
    };
}

module.exports = extractAIUsage;