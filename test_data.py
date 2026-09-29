import json

# Load vendors
with open("data/vendors.json", "r") as file:
    vendors = json.load(file)

# Load invoices
with open("data/invoices.json", "r") as file:
    invoices = json.load(file)

# Load discrepancies
with open("data/discrepancies.json", "r") as file:
    discrepancies = json.load(file)


print("Dataset loaded successfully!")
print()
print("Number of vendors:", len(vendors))
print("Number of invoices:", len(invoices))
print("Number of discrepancies:", len(discrepancies))
