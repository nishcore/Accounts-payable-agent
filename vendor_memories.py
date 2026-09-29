from memory import remember_vendor_event
from client import client


vendor_memories = [

    """
    Vendor: ABC Supplies

    ABC Supplies has an approved 10% logistics surcharge.
    This surcharge was previously reviewed and approved by the Finance team.

    Future invoices from ABC Supplies containing the same 10% logistics
    surcharge should be treated as a known vendor exception and routed
    to Finance for approval.
    """,

    """
    Vendor: TechParts Ltd

    TechParts Ltd has payment terms of Net 45 days.

    A previous invoice had a quantity discrepancy.
    The discrepancy was reviewed by the Procurement team and resolved
    after confirming the actual delivered quantity.

    Future quantity discrepancies for TechParts Ltd should be checked
    against delivery records and may require Procurement review.
    """,

    """
    Vendor: OfficePro

    OfficePro does not have an approved surcharge arrangement.

    A previous invoice contained an unexpected additional charge.
    The charge was rejected after review because there was no approved
    exception or supporting agreement.

    Future unexpected additional charges from OfficePro should be
    flagged for manual review.
    """,

    """
    Vendor: Global Logistics

    Global Logistics has an approved 5% fuel surcharge.
    The surcharge was approved by Finance as part of the vendor agreement.

    Future invoices containing a 5% fuel surcharge should be treated
    as a known vendor exception and routed to Finance for approval.
    """
]


for memory in vendor_memories:
    result = remember_vendor_event(memory)
    print("Memory stored:", result.success)


client.close()

print("\nAll vendor memories stored successfully!")
