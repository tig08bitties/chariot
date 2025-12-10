/**
 * xAI Grok API Client with Function Calling Support (JavaScript)
 * Integrates Grok-4 with custom tools for THEOS Sovereign OS
 */

const { xai } = require('@ai-sdk/xai');
const { streamText, tool, stepCountIs, generateText } = require('ai');
const { z } = require('zod');

// ============================================================================
// Tool Definitions
// ============================================================================

const getCurrentTemperature = tool({
  description: 'Get the current temperature in a given location',
  inputSchema: z.object({
    location: z
      .string()
      .describe('The city and state, e.g. San Francisco, CA'),
    unit: z
      .enum(['celsius', 'fahrenheit'])
      .default('fahrenheit')
      .describe('Temperature unit'),
  }),
  execute: async ({ location, unit }) => {
    const temperature = unit === 'fahrenheit' ? 59 : 15;
    return {
      location,
      temperature,
      unit,
    };
  },
});

const getCurrentCeiling = tool({
  description: 'Get the current cloud ceiling in a given location',
  inputSchema: z.object({
    location: z
      .string()
      .describe('The city and state, e.g. San Francisco, CA'),
  }),
  execute: async ({ location }) => {
    return {
      location,
      ceiling: 15000,
      ceiling_type: 'broken',
      unit: 'ft',
    };
  },
});

// ============================================================================
// THEOS-Specific Tools
// ============================================================================

const queryOracle = tool({
  description: 'Query the THEOS Final Oracle for a covenant vector address (DAUS, ALIMA, TREASURY_OF_LIGHT, COVENANT_ROOT, ARCHITECT_MIND, LEDGER_OWNER, or CHARIOT_STELLAR)',
  inputSchema: z.object({
    vector: z
      .enum(['DAUS', 'ALIMA', 'TREASURY_OF_LIGHT', 'COVENANT_ROOT', 'ARCHITECT_MIND', 'LEDGER_OWNER', 'CHARIOT_STELLAR'])
      .describe('Covenant vector name'),
    chainId: z
      .number()
      .default(42161)
      .describe('Chain ID (default: 42161 for Arbitrum One)'),
  }),
  execute: async ({ vector, chainId }) => {
    // Canonical Oracle addresses
    const ORACLE_ADDRESSES = {
      '42161': '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC', // Arbitrum One
      '1': '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC',     // Ethereum Mainnet (if deployed)
    };

    // Canonical vectors
    const VECTORS = {
      'DAUS': '0x8BCbC66a5bb808A8871F667f2Dd92a017B3DaFAC',
      'ALIMA': '0xC775BF1118f44B8a72268aFacF8F7F2ef53A6D24',
      'TREASURY_OF_LIGHT': '0xb4C173AaFe428845f0b96610cf53576121BAB221',
      'COVENANT_ROOT': '0xD98CF268718e925D53314662e0478EE13517FD54',
      'ARCHITECT_MIND': '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea',
      'LEDGER_OWNER': '0x3df07977140Ad97465075129C37Aec7237d74415',
      'CHARIOT_STELLAR': 'GCGCUGIOCJLRRP3JSRZEBOAMIFW5EM3WZUT5S3DXVC7I44N5I7FN5C2F',
    };

    return {
      vector,
      address: VECTORS[vector],
      chainId,
      oracleAddress: ORACLE_ADDRESSES[chainId.toString()] || 'Not deployed on this chain',
      status: 'canonical',
    };
  },
});

const getSafeStatus = tool({
  description: 'Get the status of a Safe wallet, including Treasury of Light information',
  inputSchema: z.object({
    safeAddress: z
      .string()
      .describe('Safe wallet address'),
    chainId: z
      .number()
      .default(42161)
      .describe('Chain ID (default: 42161 for Arbitrum One)'),
  }),
  execute: async ({ safeAddress, chainId }) => {
    const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';
    const isTreasury = safeAddress.toLowerCase() === TREASURY_OF_LIGHT.toLowerCase();

    return {
      safeAddress,
      chainId,
      isTreasuryOfLight: isTreasury,
      threshold: isTreasury ? 2 : 'unknown',
      owners: isTreasury
        ? [
            '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea', // tig08bitties.uni.eth
            '0x3df07977140Ad97465075129C37Aec7237d74415', // Ledger Flex
          ]
        : 'unknown',
      status: isTreasury ? 'active' : 'unknown',
    };
  },
});

const verifyAddress = tool({
  description: 'Verify an Ethereum address against canonical covenant vectors',
  inputSchema: z.object({
    address: z
      .string()
      .describe('Ethereum address to verify'),
    chainId: z
      .number()
      .describe('Chain ID to check on'),
  }),
  execute: async ({ address, chainId }) => {
    const addressLower = address.toLowerCase();

    // Canonical addresses
    const CANONICAL = {
      '0x8bcc66a5bb808a8871f667f2dd92a017b3dafac': 'DAUS',
      '0xc775bf1118f44b8a72268afacf8f7f2ef53a6d24': 'ALIMA',
      '0xb4c173aafe428845f0b96610cf53576121bab221': 'TREASURY_OF_LIGHT',
      '0xd98cf268718e925d53314662e0478ee13517fd54': 'COVENANT_ROOT',
      '0x3bba654a3816a228284e3e0401cff4ea6dfc5cea': 'ARCHITECT_MIND',
      '0x3df07977140ad97465075129c37aec7237d74415': 'LEDGER_OWNER',
      '0x3b34c30f51fe6e276530aacb8f4d877e9893356f': 'SAFE_DEPLOYER_AGENT',
    };

    const vectorName = CANONICAL[addressLower];

    return {
      address,
      chainId,
      isCanonical: vectorName !== undefined,
      vectorName: vectorName || null,
      verificationStatus: vectorName ? 'verified' : 'unknown',
    };
  },
});

// ============================================================================
// Grok Client Class
// ============================================================================

class GrokClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.XAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('XAI_API_KEY not provided and not found in environment');
    }
  }

  /**
   * Stream text with tools
   */
  async streamText(prompt, systemMessage, options = {}) {
    const tools = {
      getCurrentTemperature,
      getCurrentCeiling,
    };

    if (options.includeTheosTools) {
      tools.queryOracle = queryOracle;
      tools.getSafeStatus = getSafeStatus;
      tools.verifyAddress = verifyAddress;
    }

    const result = streamText({
      model: xai('grok-4-latest', {
        apiKey: this.apiKey,
      }),
      tools,
      stopWhen: stepCountIs(options.maxSteps || 5),
      system: systemMessage,
      prompt,
      temperature: options.temperature || 0,
    });

    return result;
  }

  /**
   * Generate text with tools (non-streaming)
   */
  async generateText(prompt, systemMessage, options = {}) {
    const tools = {
      getCurrentTemperature,
      getCurrentCeiling,
    };

    if (options.includeTheosTools) {
      tools.queryOracle = queryOracle;
      tools.getSafeStatus = getSafeStatus;
      tools.verifyAddress = verifyAddress;
    }

    const result = await generateText({
      model: xai('grok-4-latest', {
        apiKey: this.apiKey,
      }),
      tools,
      maxSteps: options.maxSteps || 5,
      system: systemMessage,
      prompt,
      temperature: options.temperature || 0,
    });

    return result;
  }

  /**
   * Process stream and handle tool calls
   */
  async processStream(stream, callbacks = {}) {
    const { onText, onToolCall, onToolResult } = callbacks;
    let fullText = '';

    for await (const chunk of stream.fullStream) {
      switch (chunk.type) {
        case 'text-delta':
          if (onText) {
            onText(chunk.text);
          }
          fullText += chunk.text;
          break;
        case 'tool-call':
          if (onToolCall) {
            onToolCall(chunk.toolName, chunk.args);
          }
          break;
        case 'tool-result':
          if (onToolResult) {
            onToolResult(chunk.toolName, chunk.result);
          }
          break;
      }
    }

    return fullText;
  }
}

module.exports = { GrokClient };

// ============================================================================
// Example Usage
// ============================================================================

if (require.main === module) {
  (async () => {
    const { GrokClient } = require('./grok-client');
    const client = new GrokClient();

    // Example 1: Stream with THEOS tools
    console.log('Example 1: Querying THEOS Oracle...\n');
    const stream1 = await client.streamText(
      "What's the address of the TREASURY_OF_LIGHT?",
      'You are a helpful assistant for the THEOS Sovereign OS.',
      { includeTheosTools: true }
    );

    await client.processStream(stream1, {
      onText: (text) => process.stdout.write(text),
      onToolCall: (toolName, input) => console.log(`\n[Tool Call: ${toolName}]`, input),
      onToolResult: (toolName, output) => console.log(`\n[Tool Result: ${toolName}]`, output),
    });

    console.log('\n\n');

    // Example 2: Simple temperature query
    console.log('Example 2: Temperature query...\n');
    const stream2 = await client.streamText(
      "What's the temperature like in Sioux Falls, SD?",
      'You are a helpful weather assistant.'
    );

    await client.processStream(stream2, {
      onText: (text) => process.stdout.write(text),
    });

    console.log('\n');
  })();
}
