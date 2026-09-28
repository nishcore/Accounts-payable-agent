from client import client, BANK_ID


def remember_vendor_event(content):
    """
    Store a vendor-related experience in Hindsight.
    """

    return client.retain(
        bank_id=BANK_ID,
        content=content
    )


def recall_vendor_memory(vendor_name, issue):
    """
    Retrieve relevant memories about a vendor.
    """

    query = f"""
    Vendor: {vendor_name}

    Current issue:
    {issue}

    Find relevant previous information about this vendor,
    including previous discrepancies, exceptions,
    payment terms, approvals and resolutions.
    """

    return client.recall(
        bank_id=BANK_ID,
        query=query
    )


def reflect_on_vendor(vendor_name, issue):
    """
    Use Hindsight memory to reason about the current
    vendor invoice situation.
    """

    query = f"""
    Vendor: {vendor_name}

    Current invoice issue:
    {issue}

    Based on the memories stored about this vendor,
    determine:

    1. What previous experience is relevant?
    2. Why is it relevant to the current invoice?
    3. What should the Accounts Payable team do?

    Provide a clear recommendation and explain the reasoning.
    """

    return client.reflect(
        bank_id=BANK_ID,
        query=query
    )