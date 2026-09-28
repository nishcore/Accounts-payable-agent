from client import client, BANK_ID


query = """
ABC Supplies has submitted a new invoice that is 10% higher
than the purchase order.

Based on everything remembered about ABC Supplies,
what should the Accounts Payable team do with this invoice?

Explain:
1. What previous experience is relevant?
2. Why is it relevant?
3. What action should the AP team take?
"""

result = client.reflect(
    bank_id=BANK_ID,
    query=query
)

print("\n===== HINDSIGHT REFLECTION =====\n")
print(result)
client.close()