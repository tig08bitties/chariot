# xAI Grok API Integration

Integration module for xAI's Grok API with function calling support for the THEOS Sovereign OS.

## Installation

```bash
pip install xai python-dotenv pydantic
```

## Environment Setup

Add to your `.env` file:

```bash
XAI_API_KEY=your-xai-api-key-here
```

## Usage

### Basic Usage

```python
from lib.xai.grok_client import GrokClient

# Initialize client
client = GrokClient()

# Simple chat with automatic tool calling
response = client.chat_with_tools(
    user_message="What's the temperature in Sioux Falls, SD?",
    system_message="You are a helpful assistant."
)
print(response)
```

### Manual Tool Calling

```python
from lib.xai.grok_client import GrokClient

client = GrokClient()

messages = [{"role": "user", "content": "What's the temperature in San Francisco?"}]
response = client.chat(messages)

# Check for tool calls
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        result = client.execute_tool_call(tool_call)
        print(result)
```

### Adding Custom Tools

```python
from lib.xai.grok_client import GrokClient
from pydantic import BaseModel, Field

# Define your tool model
class MyToolRequest(BaseModel):
    param1: str = Field(description="First parameter")
    param2: int = Field(description="Second parameter")

# Define your tool function
def my_tool(request: MyToolRequest):
    return {"result": f"Processed {request.param1} with {request.param2}"}

# Add tool to client
client = GrokClient()
client.add_tool(
    name="my_tool",
    function=my_tool,
    model=MyToolRequest,
    description="Does something useful"
)
```

## Available Tools

### `get_current_temperature`
Get the current temperature in a given location.

**Parameters:**
- `location` (string): The city and state, e.g. "San Francisco, CA"
- `unit` (string, optional): "celsius" or "fahrenheit" (default: "fahrenheit")

**Returns:**
```json
{
  "location": "San Francisco, CA",
  "temperature": 59,
  "unit": "fahrenheit"
}
```

### `get_current_ceiling`
Get the current cloud ceiling in a given location.

**Parameters:**
- `location` (string): The city and state, e.g. "San Francisco, CA"

**Returns:**
```json
{
  "location": "San Francisco, CA",
  "ceiling": 15000,
  "ceiling_type": "broken",
  "unit": "ft"
}
```

## API Reference

### `GrokClient`

#### `__init__(api_key: Optional[str] = None)`
Initialize the Grok client.

#### `chat(messages, model="grok-4-latest", tool_choice="auto", temperature=0, stream=False)`
Send a chat completion request.

#### `execute_tool_call(tool_call)`
Execute a tool call from Grok's response.

#### `chat_with_tools(user_message, system_message=None, model="grok-4-latest", max_iterations=5)`
Complete chat flow with automatic tool calling.

#### `add_tool(name, function, model, description)`
Add a custom tool to the client.

## Integration with THEOS

This module can be integrated with:
- **Covenant Oracle Queries**: Query the THEOS Final Oracle via Grok
- **Safe Transaction Monitoring**: Monitor Safe transactions with natural language
- **Multi-Chain Verification**: Verify addresses across chains
- **Documentation Assistant**: Answer questions about the covenant architecture

## Security Notes

⚠️ **API Key Security:**
- Never commit API keys to version control
- Use environment variables or secure secrets management
- Rotate keys regularly
- Monitor API usage for anomalies

## Error Handling

The client includes error handling for:
- Missing API keys
- Invalid tool calls
- Network errors
- Rate limiting

## Examples

See `examples/` directory for complete usage examples.
