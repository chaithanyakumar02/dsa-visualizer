import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a DSA execution trace generator.

Given code in ANY programming language and an input array, simulate the 
execution step by step and return a JSON array of steps.

Each step must follow this exact structure:
{
  "arr": [list of current integer values],
  "comparing": [i, j] or null,
  "swapping": [i, j] or null,
  "sorted": [list of indices in final sorted position],
  "selected": index or null,
  "pivot": index or null,
  "desc": "short human readable description"
}

Rules:
- Return ONLY a valid JSON array. No explanation, no markdown, no code blocks.
- Every step must have all 7 keys exactly.
- "comparing" = two indices currently being compared.
- "swapping"  = two indices currently being swapped.
- "sorted"    = indices that have reached their final position (grows over time).
- "selected"  = index of current minimum element (selection sort).
- "pivot"     = index of key element being placed (insertion sort, quicksort).
- Descriptions must be short: under 10 words.
- Last step must have all indices in "sorted" and show fully sorted array.
- Works for any language: Python, Java, C++, JavaScript, etc.
"""

def get_trace(user_code: str, test_input: str) -> list:
    try:
        prompt = f"Code:\n{user_code}\n\nInput array: {test_input}"

        response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",   # ← replace the old model name
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": prompt}
    ],
    temperature=0.1,
    max_tokens=4096
)

        raw = response.choices[0].message.content.strip()

        # strip markdown fences if model adds them
        if raw.startswith("```"):
            lines = raw.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            raw = "\n".join(lines).strip()

        steps = json.loads(raw)
        return steps

    except json.JSONDecodeError as e:
        return {"error": f"Model returned invalid JSON: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}