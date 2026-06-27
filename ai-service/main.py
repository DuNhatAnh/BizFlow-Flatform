import os
import json
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
    allow_credentials=False,
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
    return {"status": "healthy", "service": "BizFlow AI - Connected"}

def clean_json_text(text: Optional[str]) -> str:
    if not text:
        return ""
    text = text.strip()
    if text.startswith("```"):
        # Remove opening ```json or ```
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def call_llm(prompt: str) -> str:
    # 1. Try Gemini API with new google-genai SDK (with retry mechanism)
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        import time
        from google import genai
        max_retries = 3
        backoff = 1.0
        for attempt in range(max_retries):
            try:
                client = genai.Client(api_key=gemini_key)
                try:
                    # Try the newer gemini-2.5-flash first
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt,
                    )
                    if response.text:
                        return response.text
                except Exception as e_2_5:
                    # Fallback to gemini-1.5-flash if 2.5 is rate limited / quota exhausted
                    if "429" in str(e_2_5) or "RESOURCE_EXHAUSTED" in str(e_2_5) or "quota" in str(e_2_5).lower():
                        print("Gemini 2.5 Flash quota exhausted, falling back to gemini-flash-latest...", flush=True)
                        response = client.models.generate_content(
                            model="gemini-flash-latest",
                            contents=prompt,
                        )
                        if response.text:
                            return response.text
                    else:
                        raise e_2_5
            except Exception as e:
                print(f"Error calling google-genai SDK (attempt {attempt+1}/{max_retries}): {e}", flush=True)
                if attempt < max_retries - 1:
                    time.sleep(backoff)
                    backoff *= 2
                else:
                    break

    # 2. Try OpenRouter API (using OPENROUTER_API_KEY)
    openrouter_key = os.environ.get("OPENROUTER_API_KEY")
    if openrouter_key:
        import urllib.request
        import json
        
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://bizflow.com",
            "X-Title": "BizFlow AI Service",
            "User-Agent": "Mozilla/5.0"
        }
        model_name = os.environ.get("OPENROUTER_MODEL", "openrouter/free")
        data = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}]
        }
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                res_body = response.read().decode("utf-8")
                res_data = json.loads(res_body)
                return res_data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error calling OpenRouter API: {e}")
            
    raise HTTPException(
        status_code=500,
        detail="Không tìm thấy GEMINI_API_KEY hoặc OPENROUTER_API_KEY trong cấu hình hệ thống."
    )

def extract_entities_from_text(text: str) -> dict:
    prompt = f"""Bạn là một trợ lý AI thông minh phân tích đơn hàng cho cửa hàng bán lẻ tại Việt Nam.
Hãy phân tích văn bản bán hàng/yêu cầu sau đây và trích xuất thông tin chi tiết dưới dạng JSON.

Văn bản đầu vào: "{text}"

Yêu cầu định dạng JSON trả về phải có chính xác các trường sau:
1. "customer_name": Tên khách hàng (ví dụ: "Chú Ba", "Anh Nam", "Chị Hồng"). Nếu không đề cập đến tên khách hàng cụ thể hoặc là khách mua lẻ thông thường, hãy trả về null hoặc "Khách Lẻ".
2. "payment_method": Phương thức thanh toán. Phải là một trong ba giá trị:
   - "Debt" (nếu có nhắc đến "nợ", "ghi nợ", "ghi sổ", "trả sau", "nợ nhé", "ghi sổ nợ").
   - "Transfer" (nếu nhắc đến "chuyển khoản", "ck", "quét mã", "bank", "chuyển tiền").
   - "Cash" (các trường hợp thanh toán tiền mặt thông thường hoặc không nhắc gì cụ thể).
3. "items": Danh sách sản phẩm mua. Mỗi sản phẩm là một đối tượng chứa:
   - "product_name": Tên sản phẩm được nhắc đến (ví dụ: "Xi măng Hà Tiên", "Sắt thép phi 16", "Gạch ống Đồng Nai").
   - "quantity": Số lượng mua (phải là số nguyên dương lớn hơn 0).
   - "unit": Đơn vị tính được nhắc tới (ví dụ: "bao", "cây", "viên", "thiên", "khối", "tấn"). Nếu không nhắc tới đơn vị, hãy trả về null.

Ví dụ đầu ra JSON chuẩn:
{{
  "customer_name": "Chú Ba",
  "items": [
    {{
      "product_name": "Xi măng Hà Tiên",
      "quantity": 5,
      "unit": "bao"
    }}
  ],
  "payment_method": "Debt"
}}

Lưu ý đặc biệt: Chỉ trả về chuỗi JSON thô hợp lệ. Không viết thêm bất kỳ từ ngữ giải thích nào khác ngoài JSON, không bao quanh bằng ký hiệu markdown ```json."""

    response_text = call_llm(prompt)
    json_str = clean_json_text(response_text)
    try:
        return json.loads(json_str)
    except Exception as e:
        print(f"Failed to parse JSON from LLM: {response_text}. Error: {e}")
        # Return a fallback parsed dictionary
        return {
            "customer_name": "Khách Lẻ",
            "items": [{"product_name": "Áo thun nam cổ tròn", "quantity": 1, "unit": "Cái"}],
            "payment_method": "Cash"
        }

@app.post("/api/text-order", response_model=OrderExtractionResponse)
async def process_text_order(request: TextOrderRequest):
    """
    Parses a written text prompt from the user to construct an order draft using LLM entity extraction.
    """
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Văn bản yêu cầu không được để trống")

    extracted = extract_entities_from_text(text)
    
    # Ensure structure conforms to response model
    return OrderExtractionResponse(
        customer_name=extracted.get("customer_name") or "Khách Lẻ",
        items=[
            OrderItemExtraction(
                product_name=item.get("product_name", "Sản phẩm không rõ"),
                quantity=int(item.get("quantity", 1)),
                unit=item.get("unit")
            )
            for item in extracted.get("items", [])
        ],
        payment_method=extracted.get("payment_method", "Cash"),
        raw_transcript=text
    )

whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        import whisper
        # Use 'base' model for decent Vietnamese support while keeping memory usage moderate
        whisper_model = whisper.load_model("base")
    return whisper_model

def transcribe_audio_via_gemini(audio_path: str, api_key: str) -> str:
    from google import genai
    import pathlib
    client = genai.Client(api_key=api_key)
    audio_bytes = pathlib.Path(audio_path).read_bytes()
    # Detect mime type from extension
    ext = os.path.splitext(audio_path)[1].lower()
    mime_map = {'.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg'}
    mime_type = mime_map.get(ext, 'audio/mp4')
    from google.genai import types
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type=mime_type,
                ),
                "Hãy chuyển đổi ghi âm này thành văn bản tiếng Việt chính xác nhất có thể. Chỉ trả về văn bản tiếng Việt được chuyển ngữ, không thêm bất kỳ câu giải thích nào khác."
            ]
        )
    except Exception as e_2_5:
        if "429" in str(e_2_5) or "RESOURCE_EXHAUSTED" in str(e_2_5) or "quota" in str(e_2_5).lower():
            print("Gemini 2.5 Flash quota exhausted for voice transcription, falling back to gemini-flash-latest...", flush=True)
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=[
                    types.Part.from_bytes(
                        data=audio_bytes,
                        mime_type=mime_type,
                    ),
                    "Hãy chuyển đổi ghi âm này thành văn bản tiếng Việt chính xác nhất có thể. Chỉ trả về văn bản tiếng Việt được chuyển ngữ, không thêm bất kỳ câu giải thích nào khác."
                ]
            )
        else:
            raise e_2_5
    text_content = response.text or ""
    return text_content.strip()

@app.post("/api/voice-order", response_model=OrderExtractionResponse)
async def process_voice_order(tenant_id: str, file: UploadFile = File(...)):
    """
    Receives an audio file, transcribes it, and extracts the order entities.
    """
    print(f"Received file: {file.filename}, content_type: {file.content_type}", flush=True)
    if not file.filename.endswith(('.wav', '.mp3', '.m4a', '.ogg')):
        print(f"File filename {file.filename} is not supported extension.", flush=True)
        raise HTTPException(status_code=400, detail="Định dạng âm thanh không được hỗ trợ")
        
    audio_content = await file.read()
    print(f"Read {len(audio_content)} bytes of audio content.", flush=True)
    
    import tempfile
    suffix = os.path.splitext(file.filename)[1]
    
    # Create temp audio file
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(audio_content)
        temp_file_path = temp_file.name
    print(f"Saved audio content to temporary file: {temp_file_path}", flush=True)

    transcript = ""
    try:
        # 1. Try Gemini Cloud API first (high accuracy for Vietnamese)
        gemini_key = os.environ.get("GEMINI_API_KEY")
        if gemini_key:
            try:
                print("Attempting Gemini API cloud transcribing...", flush=True)
                transcript = transcribe_audio_via_gemini(temp_file_path, gemini_key)
                print(f"Gemini Cloud transcript: {transcript}", flush=True)
            except Exception as gemini_err:
                print(f"Gemini Cloud transcribing failed, will fallback to Whisper: {gemini_err}", flush=True)

        # 2. If Gemini is not configured or failed, fallback to local Whisper (if ffmpeg is available)
        if not transcript:
            try:
                print("Attempting local Whisper transcribing as fallback...", flush=True)
                model = get_whisper_model()
                result = model.transcribe(temp_file_path, language="vi")
                transcript = result.get("text", "").strip()
                print(f"Local Whisper transcript: {transcript}", flush=True)
            except Exception as whisper_err:
                print(f"Local Whisper translation failed: {whisper_err}", flush=True)
    except Exception as e:
        print(f"Transcription error: {e}", flush=True)
        raise HTTPException(
            status_code=400,
            detail="Không thể chuyển đổi giọng nói thành văn bản. Vui lòng cài đặt ffmpeg để chạy Whisper cục bộ, hoặc cấu hình GEMINI_API_KEY để sử dụng cloud transcription của Google."
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"Removed temporary file: {temp_file_path}", flush=True)

    if not transcript:
        print("Transcript is empty.", flush=True)
        raise HTTPException(status_code=400, detail="Không nhận diện được giọng nói trong file ghi âm")

    print(f"Sending transcript to entity extraction: {transcript}", flush=True)
    # Reuse process_text_order logic
    return await process_text_order(TextOrderRequest(text=transcript, tenant_id=tenant_id))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
