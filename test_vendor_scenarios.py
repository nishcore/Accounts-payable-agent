from memory import recall_vendor_memory
from client import client


scenarios = [
    (
        "ABC Supplies",
        "A new invoice is 10% higher than the purchase order."
    ),
    (
        "TechParts Ltd",
        "The invoice quantity is higher than the quantity recorded in the delivery."
    ),
    (
        "OfficePro",
        "The invoice contains an unexpected additional charge."
    ),
    (
        "Global Logistics",
        "The invoice contains a 5% fuel surcharge."
    )
]


for vendor, issue in scenarios:

    print("\n========================================")
    print("VENDOR:", vendor)
    print("ISSUE:", issue)
    print("========================================\n")

    result = recall_vendor_memory(
        vendor,
        issue
    )

    for memory in result.results[:3]:
        print("MEMORY:")
        print(memory.text)
        print("----------------------------------------")


client.close()