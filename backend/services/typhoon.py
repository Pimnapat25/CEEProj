import base64
import json
import httpx
from config import settings


async def ocr_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Call Typhoon vision model to extract raw text from a food label image."""
    b64 = base64.b64encode(image_bytes).decode()
    payload = {
        "model": "typhoon-v2-vision-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{b64}"},
                    },
                    {
                        "type": "text",
                        "text": "Extract all text visible on this food product label. Return only the raw text, no commentary.",
                    },
                ],
            }
        ],
        "max_tokens": 512,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{settings.typhoon_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.typhoon_api_key}"},
            json=payload,
        )
        resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


async def parse_label(ocr_text: str) -> dict:
    """Call Typhoon LLM to extract product name and expiry date from OCR text."""
    prompt = (
        "From the following OCR text extracted from a food product label, "
        "identify the product name and expiry date.\n"
        "Return ONLY valid JSON with keys: name (string), expiry_date (string, format YYYY-MM-DD or null if not found).\n\n"
        f"OCR text:\n{ocr_text}"
    )
    payload = {
        "model": "typhoon-v2-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 128,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{settings.typhoon_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.typhoon_api_key}"},
            json=payload,
        )
        resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    return json.loads(content)
