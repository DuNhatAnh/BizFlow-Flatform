import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="BizFlow AI Service",
    description="Microservice for speech-to-text transcribing and order entity extraction using Whisper & Gemini API",
    version="1.0.0"
)

# Enable CORS for Next.js web application and .NET API communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OrderItemExtraction(BaseModel):
    product_name: str
    quantity: int
    unit: Optional[str] = None

class OrderExtractionResponse(BaseModel):
    customer_name: Optional[str] = None
    items: List[OrderItemExtraction]
    payment_method: str  # Cash, Transfer, Debt
    raw_transcript: str

class TextOrderRequest(BaseModel):
    text: str
    tenant_id: str

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "BizFlow AI - Reloader Test"}

@app.post("/api/text-order", response_model=OrderExtractionResponse)
async def process_text_order(request: TextOrderRequest):
    """
    Parses a written text prompt from the user to construct an order draft using LLM entity extraction.
    Example input: "Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen"
    """
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text prompt cannot be empty")

    # In a real environment, you would call Gemini API here:
    # model = genai.GenerativeModel('gemini-1.5-flash')
    # response = model.generate_content(...)
    
    # Mocking Gemini Entity Extraction output for demonstration based on user input:
    raw_text_lower = text.lower()
    
    customer = "Khách vãng lai"
    if "chú ba" in raw_text_lower:
        customer = "Chú Ba"
    elif "anh nam" in raw_text_lower:
        customer = "Anh Nam"
        
    payment = "Cash"
    if "nợ" in raw_text_lower or "ghi nợ" in raw_text_lower:
        payment = "Debt"
    elif "chuyển khoản" in raw_text_lower or "ck" in raw_text_lower:
        payment = "Transfer"

    items = []
    if "xi măng" in raw_text_lower:
        items.append(OrderItemExtraction(product_name="Xi măng Hà Tiên", quantity=5, unit="Bao"))
    else:
        # Default mock item if text is custom
        items.append(OrderItemExtraction(product_name="Áo thun nam cổ tròn", quantity=1, unit="Cái"))

    return OrderExtractionResponse(
        customer_name=customer,
        items=items,
        payment_method=payment,
        raw_transcript=text
    )

@app.post("/api/voice-order", response_model=OrderExtractionResponse)
async def process_voice_order(tenant_id: str, file: UploadFile = File(...)):
    """
    Receives an audio file (e.g. WAV/MP3), transcribes it using Whisper,
    then parses the entities using Gemini API.
    """
    if not file.filename.endswith(('.wav', '.mp3', '.m4a', '.ogg')):
        raise HTTPException(status_code=400, detail="Unsupported audio format")
        
    # Read audio bytes
    audio_content = await file.read()
    
    # Simulate Whisper Speech-To-Text transcription
    # model = whisper.load_model("base")
    # result = model.transcribe(temp_audio_file_path)
    # transcript = result["text"]
    
    simulated_transcript = "Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen"
    
    # Parse entities
    return await process_text_order(TextOrderRequest(text=simulated_transcript, tenant_id=tenant_id))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
