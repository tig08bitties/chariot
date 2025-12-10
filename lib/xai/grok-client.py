"""
xAI Grok API Client with Function Calling Support
Integrates Grok-4 with custom tools for THEOS Sovereign OS
"""

import json
from typing import Literal, Dict, Any, List, Optional, Callable
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from xai import XAI
except ImportError:
    XAI = None
    print("Warning: xAI SDK not installed. Install with: pip install xai")


# ============================================================================
# Pydantic Models for Tool Definitions
# ============================================================================

class TemperatureRequest(BaseModel):
    """Request model for temperature queries"""
    location: str = Field(description="The city and state, e.g. San Francisco, CA")
    unit: Literal["celsius", "fahrenheit"] = Field(
        "fahrenheit", description="Temperature unit"
    )


class CeilingRequest(BaseModel):
    """Request model for cloud ceiling queries"""
    location: str = Field(description="The city and state, e.g. San Francisco, CA")


# ============================================================================
# Tool Functions
# ============================================================================

def get_current_temperature(request: TemperatureRequest) -> Dict[str, Any]:
    """
    Get the current temperature in a given location
    
    Args:
        request: TemperatureRequest with location and unit
        
    Returns:
        Dictionary with location, temperature, and unit
    """
    temperature = 59 if request.unit.lower() == "fahrenheit" else 15
    return {
        "location": request.location,
        "temperature": temperature,
        "unit": request.unit,
    }


def get_current_ceiling(request: CeilingRequest) -> Dict[str, Any]:
    """
    Get the current cloud ceiling in a given location
    
    Args:
        request: CeilingRequest with location
        
    Returns:
        Dictionary with location, ceiling, ceiling_type, and unit
    """
    return {
        "location": request.location,
        "ceiling": 15000,
        "ceiling_type": "broken",
        "unit": "ft",
    }


# ============================================================================
# Tool Definitions Generator
# ============================================================================

def generate_tool_definitions() -> List[Dict[str, Any]]:
    """
    Generate tool definitions from Pydantic models
    
    Returns:
        List of tool definition dictionaries
    """
    get_current_temperature_schema = TemperatureRequest.model_json_schema()
    get_current_ceiling_schema = CeilingRequest.model_json_schema()
    
    return [
        {
            "type": "function",
            "function": {
                "name": "get_current_temperature",
                "description": "Get the current temperature in a given location",
                "parameters": get_current_temperature_schema,
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_current_ceiling",
                "description": "Get the current cloud ceiling in a given location",
                "parameters": get_current_ceiling_schema,
            }
        },
    ]


# Tools mapping for function execution
TOOLS_MAP: Dict[str, Callable] = {
    "get_current_temperature": get_current_temperature,
    "get_current_ceiling": get_current_ceiling,
}


# ============================================================================
# Grok Client Class
# ============================================================================

class GrokClient:
    """
    xAI Grok API Client with function calling support
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Grok client
        
        Args:
            api_key: xAI API key (defaults to XAI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("XAI_API_KEY")
        if not self.api_key:
            raise ValueError("XAI_API_KEY not provided and not found in environment")
        
        if XAI is None:
            raise ImportError("xAI SDK not installed. Install with: pip install xai")
        
        self.client = XAI(api_key=self.api_key)
        self.tool_definitions = generate_tool_definitions()
        self.tools_map = TOOLS_MAP.copy()
    
    def add_tool(self, name: str, function: Callable, model: BaseModel, description: str):
        """
        Add a custom tool to the client
        
        Args:
            name: Tool function name
            function: Callable function
            model: Pydantic model for parameters
            description: Tool description
        """
        schema = model.model_json_schema()
        tool_def = {
            "type": "function",
            "function": {
                "name": name,
                "description": description,
                "parameters": schema,
            }
        }
        self.tool_definitions.append(tool_def)
        self.tools_map[name] = function
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "grok-4-latest",
        tool_choice: str = "auto",
        temperature: float = 0,
        stream: bool = False
    ) -> Any:
        """
        Send a chat completion request
        
        Args:
            messages: List of message dictionaries
            model: Model name (default: "grok-4-latest")
            tool_choice: Tool choice mode (default: "auto")
            temperature: Sampling temperature (default: 0)
            stream: Whether to stream responses (default: False)
            
        Returns:
            Chat completion response
        """
        return self.client.chat.completions.create(
            model=model,
            messages=messages,
            tools=self.tool_definitions,
            tool_choice=tool_choice,
            temperature=temperature,
            stream=stream
        )
    
    def execute_tool_call(self, tool_call: Any) -> Dict[str, Any]:
        """
        Execute a tool call from Grok's response
        
        Args:
            tool_call: Tool call object from Grok response
            
        Returns:
            Tool response dictionary
        """
        function_name = tool_call.function.name
        
        if function_name not in self.tools_map:
            return {
                "error": f"Function {function_name} not found",
                "tool_call_id": tool_call.id
            }
        
        try:
            function_args = json.loads(tool_call.function.arguments)
            
            # Get the appropriate Pydantic model for validation
            if function_name == "get_current_temperature":
                request = TemperatureRequest(**function_args)
                result = self.tools_map[function_name](request)
            elif function_name == "get_current_ceiling":
                request = CeilingRequest(**function_args)
                result = self.tools_map[function_name](request)
            else:
                # Generic call for custom tools
                result = self.tools_map[function_name](**function_args)
            
            return {
                "content": json.dumps(result),
                "tool_call_id": tool_call.id
            }
        except Exception as e:
            return {
                "error": str(e),
                "tool_call_id": tool_call.id
            }
    
    def chat_with_tools(
        self,
        user_message: str,
        system_message: Optional[str] = None,
        model: str = "grok-4-latest",
        max_iterations: int = 5
    ) -> str:
        """
        Complete chat flow with automatic tool calling
        
        Args:
            user_message: User's message
            system_message: Optional system message
            model: Model name
            max_iterations: Maximum tool call iterations
            
        Returns:
            Final response content
        """
        messages = []
        
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": user_message})
        
        iteration = 0
        while iteration < max_iterations:
            # Get response from Grok
            response = self.chat(messages, model=model)
            assistant_message = response.choices[0].message
            
            # Append assistant message
            messages.append({
                "role": assistant_message.role,
                "content": assistant_message.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": tc.type,
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    } for tc in (assistant_message.tool_calls or [])
                ] if assistant_message.tool_calls else None
            })
            
            # Check if there are tool calls
            if assistant_message.tool_calls:
                for tool_call in assistant_message.tool_calls:
                    tool_result = self.execute_tool_call(tool_call)
                    messages.append({
                        "role": "tool",
                        "content": tool_result.get("content", json.dumps(tool_result)),
                        "tool_call_id": tool_result.get("tool_call_id")
                    })
                iteration += 1
            else:
                # No more tool calls, return final response
                return assistant_message.content or ""
        
        # Max iterations reached
        return messages[-1].get("content", "Maximum iterations reached")


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    # Initialize client
    client = GrokClient()
    
    # Example 1: Simple chat with tools
    response = client.chat_with_tools(
        user_message="What's the temperature like in San Francisco?",
        system_message="You are a helpful weather assistant."
    )
    print("Response:", response)
    
    # Example 2: Manual tool calling
    messages = [{"role": "user", "content": "What's the temperature in Sioux Falls, SD?"}]
    response = client.chat(messages)
    
    if response.choices[0].message.tool_calls:
        for tool_call in response.choices[0].message.tool_calls:
            result = client.execute_tool_call(tool_call)
            print("Tool result:", result)
