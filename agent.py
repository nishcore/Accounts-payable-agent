
import ollama


# Ollama is running on Windows and is accessed from Ubuntu/WSL
OLLAMA_HOST = "http://172.23.16.1:11434"

client = ollama.Client(host=OLLAMA_HOST)

# Fast model for local inference
MODEL = "qwen2.5:1.5b"


def analyze_invoice_with_ai(
    invoice,
    current_issue,
    memories
):
    """
    Analyze an invoice using:
    1. Current invoice information
    2. Current discrepancy
    3. Relevant Hindsight memories
    """

    # --------------------------------------------------------
    # Prepare Hindsight memories
    # --------------------------------------------------------

    memory_text = ""

    if memories:

        relevant_memories = memories[:5]

        for i, memory in enumerate(
            relevant_memories,
            start=1
        ):

            if isinstance(memory, dict):

                memory_content = memory.get(
                    "text",
                    str(memory)
                )

            else:

                memory_content = str(memory)

            memory_text += f"""
Memory {i}:
{memory_content}
"""

    else:

        memory_text = (
            "No relevant previous vendor memory was found."
        )

    # --------------------------------------------------------
    # AI prompt
    # --------------------------------------------------------

    prompt = f"""
You are an AI Accounts Payable Agent.

Your job is to analyze an invoice using:

1. Current invoice information
2. Current discrepancy
3. Relevant historical vendor memories

CURRENT INVOICE:
{invoice}

CURRENT ISSUE:
{current_issue}

RELEVANT HINDSIGHT MEMORIES:
{memory_text}

Analyze the invoice carefully.

IMPORTANT DECISION RULES:

1. If there is an amount mismatch, do NOT automatically
   assume fraud.

2. If supporting documents or a corrected invoice are
   required, choose MANUAL REVIEW.

3. Choose REJECT only when the available information
   clearly indicates that the invoice should not be paid.

4. Choose APPROVE only when there is enough evidence
   that the invoice is valid.

5. Use Hindsight memories when they are relevant.

6. Do not invent previous vendor experiences.

7. If a previous vendor resolution exists, explain how
   it applies to the current invoice.

Return your answer using exactly these sections:

DECISION:
Choose exactly one:
APPROVE
REJECT
MANUAL REVIEW

REASON:
Explain the reason for the decision.

MEMORY USED:
Explain which Hindsight memory was relevant.
If no memory was relevant, clearly say so.

RECOMMENDED ACTION:
Explain what the Accounts Payable team should do next.

Keep the answer concise and practical.
"""

    # --------------------------------------------------------
    # Call Qwen through Ollama
    # --------------------------------------------------------

    response = client.chat(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]

