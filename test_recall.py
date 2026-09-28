from memory import recall_vendor_memory


query = """
A new invoice from ABC Supplies is 10% higher than the purchase order.

The invoice may contain the same type of logistics surcharge
that appeared in a previous invoice.

What previous exceptions, approvals, or resolutions do we know
about ABC Supplies?
"""

result = recall_vendor_memory(query)

print("\n===== HINDSIGHT RECALL =====\n")

for item in result.results:
    print("Memory:")
    print(item.text)
    print("\n----------------------------\n")