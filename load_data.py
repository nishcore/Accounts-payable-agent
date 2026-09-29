import json
import psycopg2


# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="ap_agent_db",
    user="postgres",
    password="postgres123",
    host="localhost",
    port="5432"
)

cursor = conn.cursor()


# Load JSON files
with open("data/vendors.json", "r") as f:
    vendors = json.load(f)

with open("data/invoices.json", "r") as f:
    invoices = json.load(f)

with open("data/discrepancies.json", "r") as f:
    discrepancies = json.load(f)


# Insert vendors
for vendor in vendors:
    cursor.execute(
        """
        INSERT INTO vendors
        (vendor_id, vendor_name, industry, payment_terms, normal_invoice_amount)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (vendor_id) DO NOTHING
        """,
        (
            vendor["vendor_id"],
            vendor["vendor_name"],
            vendor["industry"],
            vendor["payment_terms"],
            vendor["normal_invoice_amount"]
        )
    )


# Insert invoices
for invoice in invoices:
    cursor.execute(
        """
        INSERT INTO invoices
        (invoice_id, vendor, amount, invoice_date, due_date, po_number, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (invoice_id) DO NOTHING
        """,
        (
            invoice["invoice_id"],
            invoice["vendor"],
            invoice["amount"],
            invoice["invoice_date"],
            invoice["due_date"],
            invoice["po_number"],
            invoice["status"]
        )
    )


# Insert discrepancies
for discrepancy in discrepancies:
    cursor.execute(
        """
        INSERT INTO discrepancies
        (invoice, problem, previous_resolution)
        VALUES (%s, %s, %s)
        """,
        (
            discrepancy["invoice"],
            discrepancy["problem"],
            discrepancy["previous_resolution"]
        )
    )


# Save changes
conn.commit()

print("Data loaded successfully!")
print("Vendors:", len(vendors))
print("Invoices:", len(invoices))
print("Discrepancies:", len(discrepancies))


cursor.close()
conn.close()
