import sys
import os

# Add ai-service to path
sys.path.append(os.path.abspath("ai-service"))

import main
from main import extract_entities_from_text, TextOrderRequest, process_text_order
import asyncio

async def test():
    print("Testing extract_entities_from_text directly...")
    try:
        res = extract_entities_from_text("lấy cho chú ba 5 khối đá xây dựng")
        print("extract_entities_from_text Result:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

    print("\nTesting process_text_order directly...")
    try:
        req = TextOrderRequest(text="lấy cho chú ba 5 khối đá xây dựng", tenant_id="11111111-1111-1111-1111-111111111111")
        res = await process_text_order(req)
        print("process_text_order Result:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
