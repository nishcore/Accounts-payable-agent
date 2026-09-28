from memory import remember_vendor_event


vendor_memory = """
Vendor: ABC Supplies

ABC Supplies has an approved 10% logistics surcharge.
This surcharge was previously reviewed and approved by the Finance team.

When future invoices from ABC Supplies contain a similar 10% discrepancy
caused by the logistics surcharge, the invoice should be treated as a
known vendor exception and routed to Finance for approval.
"""

result = remember_vendor_event(vendor_memory)

print("Vendor memory stored successfully!")
print(result)