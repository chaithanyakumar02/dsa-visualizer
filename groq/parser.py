import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a DSA execution trace generator.

Given code in ANY programming language and an input, analyze the code and
detect which data structure it uses, then simulate execution step by step.

First detect the type:
- "array"      — sorting, searching, two pointers, sliding window
- "tree"       — binary tree, BST, tree traversal
- "linkedlist" — linked list operations

Then return a JSON object in this exact format:
{
  "type": "array" | "tree" | "linkedlist",
  "steps": [ ... ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
IF type = "array", each step:
{
  "arr":       [current array values],
  "comparing": [i, j] or null,
  "swapping":  [i, j] or null,
  "sorted":    [indices in final position],
  "selected":  index or null,
  "pivot":     index or null,
  "left":      index or null,
  "right":     index or null,
  "desc":      "short description"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
IF type = "tree", each step:
{
  "tree":      [list of node values in the BST at this moment],
  "highlight": [values currently being compared or visited],
  "inserted":  value just inserted or null,
  "traversal": [values visited so far in traversal order],
  "desc":      "short description"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
IF type = "linkedlist", each step:
{
  "list":       [current node values in order],
  "active":     index of node being visited or null,
  "connecting": [from_index, to_index] showing pointer change or null,
  "found":      [indices confirmed/found],
  "newNode":    value of newly created node or null,
  "desc":       "short description"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Rules:
- Return ONLY valid JSON. No explanation, no markdown, no code blocks.
- Every step must have ALL keys for its type.
- Descriptions under 10 words.
- Last step shows final state with everything complete.
- Works for any language: Python, Java, C++, JavaScript, etc.
"""

def get_trace(user_code: str, test_input: str) -> dict:
    try:
        prompt = f"Code:\n{user_code}\n\nInput: {test_input}"

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
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
            raw   = "\n".join(lines).strip()

        result = json.loads(raw)
        return result

    except json.JSONDecodeError as e:
        return {"error": f"Model returned invalid JSON: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}