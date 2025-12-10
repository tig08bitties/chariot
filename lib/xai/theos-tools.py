"""
THEOS-specific tools for Grok API integration
Provides covenant-aware functions for querying THEOS system
"""

from typing import Dict, Any
from pydantic import BaseModel, Field
import json


# ============================================================================
# THEOS Tool Models
# ============================================================================

class OracleQueryRequest(BaseModel):
    """Request model for Oracle queries"""
    vector: str = Field(description="Covenant vector name: DAUS, ALIMA, TREASURY_OF_LIGHT, COVENANT_ROOT, ARCHITECT_MIND, LEDGER_OWNER, or CHARIOT_STELLAR")
    chain_id: int = Field(42161, description="Chain ID (default: 42161 for Arbitrum One)")


class SafeStatusRequest(BaseModel):
    """Request model for Safe status queries"""
    safe_address: str = Field(description="Safe wallet address")
    chain_id: int = Field(42161, description="Chain ID (default: 42161 for Arbitrum One)")


class AddressVerifyRequest(BaseModel):
    """Request model for address verification"""
    address: str = Field(description="Ethereum address to verify")
    chain_id: int = Field(description="Chain ID to check on")


# ============================================================================
# THEOS Tool Functions
# ============================================================================

def query_oracle(request: OracleQueryRequest) -> Dict[str, Any]:
    """
    Query the THEOS Final Oracle for a covenant vector
    
    Args:
        request: OracleQueryRequest with vector name and chain ID
        
    Returns:
        Dictionary with vector name, address, and chain ID
    """
    # Canonical Oracle addresses
    ORACLE_ADDRESSES = {
        "42161": "0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC",  # Arbitrum One
        "1": "0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC",      # Ethereum Mainnet (if deployed)
    }
    
    # Canonical vectors
    VECTORS = {
        "DAUS": "0x8BCbC66a5bb808A8871F667f2Dd92a017B3DaFAC",
        "ALIMA": "0xC775BF1118f44B8a72268aFacF8F7F2ef53A6D24",
        "TREASURY_OF_LIGHT": "0xb4C173AaFe428845f0b96610cf53576121BAB221",
        "COVENANT_ROOT": "0xD98CF268718e925D53314662e0478EE13517FD54",
        "ARCHITECT_MIND": "0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea",
        "LEDGER_OWNER": "0x3df07977140Ad97465075129C37Aec7237d74415",
        "CHARIOT_STELLAR": "GCGCUGIOCJLRRP3JSRZEBOAMIFW5EM3WZUT5S3DXVC7I44N5I7FN5C2F",
    }
    
    vector_upper = request.vector.upper()
    
    if vector_upper not in VECTORS:
        return {
            "error": f"Unknown vector: {request.vector}",
            "available_vectors": list(VECTORS.keys())
        }
    
    return {
        "vector": vector_upper,
        "address": VECTORS[vector_upper],
        "chain_id": request.chain_id,
        "oracle_address": ORACLE_ADDRESSES.get(str(request.chain_id), "Not deployed on this chain"),
        "status": "canonical"
    }


def get_safe_status(request: SafeStatusRequest) -> Dict[str, Any]:
    """
    Get status of a Safe wallet
    
    Args:
        request: SafeStatusRequest with Safe address and chain ID
        
    Returns:
        Dictionary with Safe status information
    """
    # Treasury of Light canonical address
    TREASURY_OF_LIGHT = "0xb4C173AaFe428845f0b96610cf53576121BAB221"
    
    is_treasury = request.safe_address.lower() == TREASURY_OF_LIGHT.lower()
    
    return {
        "safe_address": request.safe_address,
        "chain_id": request.chain_id,
        "is_treasury_of_light": is_treasury,
        "threshold": 2 if is_treasury else "unknown",
        "owners": [
            "0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea",  # tig08bitties.uni.eth
            "0x3df07977140Ad97465075129C37Aec7237d74415"   # Ledger Flex
        ] if is_treasury else "unknown",
        "status": "active" if is_treasury else "unknown"
    }


def verify_address(request: AddressVerifyRequest) -> Dict[str, Any]:
    """
    Verify an Ethereum address against canonical covenant vectors
    
    Args:
        request: AddressVerifyRequest with address and chain ID
        
    Returns:
        Dictionary with verification results
    """
    address_lower = request.address.lower()
    
    # Canonical addresses
    CANONICAL = {
        "0x8bcc66a5bb808a8871f667f2dd92a017b3dafac": "DAUS",
        "0xc775bf1118f44b8a72268afacf8f7f2ef53a6d24": "ALIMA",
        "0xb4c173aafe428845f0b96610cf53576121bab221": "TREASURY_OF_LIGHT",
        "0xd98cf268718e925d53314662e0478ee13517fd54": "COVENANT_ROOT",
        "0x3bba654a3816a228284e3e0401cff4ea6dfc5cea": "ARCHITECT_MIND",
        "0x3df07977140ad97465075129c37aec7237d74415": "LEDGER_OWNER",
        "0x3b34c30f51fe6e276530aacb8f4d877e9893356f": "SAFE_DEPLOYER_AGENT",
    }
    
    vector_name = CANONICAL.get(address_lower)
    
    return {
        "address": request.address,
        "chain_id": request.chain_id,
        "is_canonical": vector_name is not None,
        "vector_name": vector_name,
        "verification_status": "verified" if vector_name else "unknown"
    }


# ============================================================================
# Tool Definitions for Grok
# ============================================================================

def get_theos_tool_definitions() -> list:
    """
    Get tool definitions for THEOS-specific functions
    
    Returns:
        List of tool definition dictionaries
    """
    oracle_schema = OracleQueryRequest.model_json_schema()
    safe_schema = SafeStatusRequest.model_json_schema()
    verify_schema = AddressVerifyRequest.model_json_schema()
    
    return [
        {
            "type": "function",
            "function": {
                "name": "query_oracle",
                "description": "Query the THEOS Final Oracle for a covenant vector address (DAUS, ALIMA, TREASURY_OF_LIGHT, etc.)",
                "parameters": oracle_schema,
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_safe_status",
                "description": "Get the status of a Safe wallet, including Treasury of Light information",
                "parameters": safe_schema,
            }
        },
        {
            "type": "function",
            "function": {
                "name": "verify_address",
                "description": "Verify an Ethereum address against canonical covenant vectors",
                "parameters": verify_schema,
            }
        },
    ]


# Tools mapping
THEOS_TOOLS_MAP = {
    "query_oracle": query_oracle,
    "get_safe_status": get_safe_status,
    "verify_address": verify_address,
}
