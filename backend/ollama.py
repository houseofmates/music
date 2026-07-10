"""olmama bridge for local llm inference.

this module talks to a local ollama endpoint (qwen2.5:7b) to parse prompts
and normalize metadata. all requests are local-only and do not call external
apis.
"""

import os
import json
import logging
import requests
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b-instruct-q4_K_S")


def _complete(prompt: str, max_tokens: int = 256, temperature: float = 0.2) -> str:
    url = f"{OLLAMA_URL}/v1/completions"
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False,
    }
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # ollama returns {choices:[{message:{content:...}}]} or {choices:[{text:...}]}
    if isinstance(data, dict):
        if "choices" in data and len(data["choices"]) > 0:
            choice = data["choices"][0]
            if "message" in choice and isinstance(choice["message"], dict):
                return choice["message"].get("content", "") or ""
            return choice.get("text", "") or ""
    return ""


def parse_prompt(prompt: str) -> Dict[str, Any]:
    """parse a natural language playlist prompt into keywords/mood/tempo."""
    system = (
        "you are a parsing assistant. given a user prompt about generating a music playlist, "
        "output a json object with keys: keywords (array of words), mood (short string), "
        "tempo (one of slow/medium/fast/unknown). only output valid json without extra text."
    )
    user = f"prompt: {prompt}\n\njson:"  # encourage json only
    full = system + "\n\n" + user

    out = _complete(full, max_tokens=256, temperature=0.0)
    # attempt to extract json blob
    try:
        start = out.find("{")
        if start >= 0:
            out = out[start:]
        return json.loads(out)
    except Exception:
        return {"keywords": [], "mood": "", "tempo": ""}


def normalize_metadata(pairs: List[tuple]) -> Dict[str, Dict[str, str]]:
    """normalize artist/album pairs into canonical values.

    returns a mapping from "artist||album" to {"artist": ..., "album": ...}
    """
    # build a minimal prompt with examples
    sample = "\n".join([f"- {a} || {b}" for a, b in pairs[:20]])
    system = (
        "you are a metadata normalizer. given a list of artist and album pairs, "
        "produce a json object mapping each original pair string to a canonical "
        "artist and album. do not output any extra text."
    )
    user = f"pairs:\n{sample}\n\njson:"
    full = system + "\n\n" + user
    out = _complete(full, max_tokens=512, temperature=0.0)

    try:
        start = out.find("{")
        if start >= 0:
            out = out[start:]
        parsed = json.loads(out)
        if isinstance(parsed, dict):
            return parsed
    except Exception as e:
        logger.warning("Failed to parse LLM normalization output: %s", e)
    return {}
