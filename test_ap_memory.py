from memory import (
    remember_vendor_event,
    recall_vendor_memory,
    reflect_on_vendor
)
from client import client


# 1. Store previous vendor experience
print("\n===== RETAIN =====\n")

remember_vendor_event("""
Vendor: ABC Supplies

ABC Supplies has an approved 10% logistics surcharge.
The surcharge was previously reviewed and approved by the Finance team.

Future invoices containing the same 10% surcharge should be
treated as a known vendor exception and routed to Finance
for approval.
""")

print("Vendor experience stored successfully.")


# 2. Recall previous experience
print("\n===== RECALL =====\n")

memories = recall_vendor_memory(
    "ABC Supplies",
    "A new invoice is 10% higher than the purchase order."
)

for memory in memories.results:
    print(memory.text)
    print("--------------------")


# 3. Reflect on the current situation
print("\n===== REFLECT =====\n")

reflection = reflect_on_vendor(
    "ABC Supplies",
    "A new invoice is 10% higher than the purchase order."
)

print(reflection.text)


# Close Hindsight client
client.close()