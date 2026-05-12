import json
import httpx
from fastapi import HTTPException
from config import settings


async def ocr_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Call Typhoon OCR endpoint to extract all text from a food label image."""
    ext_map = {"image/jpeg": "image.jpg", "image/png": "image.png", "image/webp": "image.webp"}
    filename = ext_map.get(mime_type, "image.jpg")

    async with httpx.AsyncClient(timeout=300) as client:
        resp = await client.post(
            f"{settings.typhoon_base_url}/ocr",
            headers={"Authorization": f"Bearer {settings.typhoon_api_key}"},
            files={"file": (filename, image_bytes, mime_type)},
            data={
                "model": "typhoon-ocr",
                "task_type": "default",
                "max_tokens": "16384",
                "temperature": "0.1",
                "top_p": "0.6",
                "repetition_penalty": "1.2",
            },
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Typhoon OCR error: {resp.text}")

    texts = []
    for page in resp.json().get("results", []):
        if page.get("success") and page.get("message"):
            content = page["message"]["choices"][0]["message"]["content"]
            try:
                parsed = json.loads(content)
                texts.append(parsed.get("natural_text", content))
            except json.JSONDecodeError:
                texts.append(content)
    return "\n".join(texts)


async def parse_label(ocr_text: str) -> dict:
    """Call Typhoon LLM to extract product name and expiry date from OCR text."""
    prompt = (
        "From the following OCR text extracted from a food product label (may be in Thai or English), "
        "extract the following fields.\n"
        "Return ONLY valid JSON with these keys:\n"
        "  name (string): product name\n"
        "  expiry_date (string): expiry/best-before date in YYYY-MM-DD format, or null if not found\n"
        "  ingredients (string): full ingredients list as plain text, or null if not found\n"
        "  net_weight (string): net weight/volume, or null if not found\n"
        "  storage (string): storage instructions, or null if not found\n\n"
        f"OCR text:\n{ocr_text}"
    )
    payload = {
        "model": "typhoon-v2.5-30b-a3b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2048,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{settings.typhoon_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.typhoon_api_key}"},
            json=payload,
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Typhoon LLM error: {resp.text}")
        resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"name": None, "expiry_date": None, "ingredients": None, "net_weight": None, "storage": None, "_raw": content}
