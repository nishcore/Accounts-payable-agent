from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection
from memory import recall_vendor_memory
from agent import analyze_invoice_with_ai, MODEL


app = FastAPI(title="AI Accounts Payable Agent")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "AI Accounts Payable Agent Backend is running!"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "agent": "Ollama",
        "model": MODEL
    }


# ============================================================
# GET ALL VENDORS
# ============================================================

@app.get("/vendors")
def get_vendors():

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                vendor_id,
                vendor_name,
                industry,
                payment_terms,
                normal_invoice_amount
            FROM vendors
            ORDER BY vendor_id
        """)

        rows = cursor.fetchall()

        vendors = []

        for row in rows:
            vendors.append({
                "vendor_id": row[0],
                "vendor_name": row[1],
                "industry": row[2],
                "payment_terms": row[3],
                "normal_invoice_amount": float(row[4])
                if row[4] is not None else None
            })

        return vendors

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch vendors: {str(e)}"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ============================================================
# GET ALL INVOICES
# ============================================================

@app.get("/invoices")
def get_invoices():

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                i.invoice_id,
                i.vendor,
                v.vendor_name,
                v.industry,
                v.payment_terms,
                v.normal_invoice_amount,
                i.amount,
                i.invoice_date,
                i.due_date,
                i.po_number,
                i.status
            FROM invoices i
            LEFT JOIN vendors v
                ON i.vendor = v.vendor_id
            ORDER BY i.invoice_date DESC
        """)

        rows = cursor.fetchall()

        invoices = []

        for row in rows:
            invoices.append({
                "invoice_id": row[0],
                "vendor_id": row[1],
                "vendor_name": row[2],
                "industry": row[3],
                "payment_terms": row[4],
                "normal_invoice_amount": float(row[5])
                if row[5] is not None else None,
                "amount": float(row[6])
                if row[6] is not None else None,
                "invoice_date": str(row[7])
                if row[7] is not None else None,
                "due_date": str(row[8])
                if row[8] is not None else None,
                "po_number": row[9],
                "status": row[10]
            })

        return invoices

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch invoices: {str(e)}"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ============================================================
# GET ALL DISCREPANCIES
# ============================================================

@app.get("/discrepancies")
def get_discrepancies():

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                d.invoice,
                d.problem,
                d.previous_resolution,
                i.vendor,
                v.vendor_name,
                i.amount,
                i.status
            FROM discrepancies d
            LEFT JOIN invoices i
                ON d.invoice = i.invoice_id
            LEFT JOIN vendors v
                ON i.vendor = v.vendor_id
            ORDER BY d.invoice
        """)

        rows = cursor.fetchall()

        discrepancies = []

        for row in rows:
            discrepancies.append({
                "invoice": row[0],
                "problem": row[1],
                "previous_resolution": row[2],
                "vendor_id": row[3],
                "vendor_name": row[4],
                "amount": float(row[5])
                if row[5] is not None else None,
                "status": row[6]
            })

        return discrepancies

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch discrepancies: {str(e)}"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ============================================================
# ANALYZE SINGLE INVOICE
# ============================================================

@app.get("/analyze-invoice/{invoice_id}")
def analyze_invoice(invoice_id: str):

    conn = None
    cursor = None

    try:

        # ------------------------------------------------------
        # 1. Connect to PostgreSQL
        # ------------------------------------------------------

        conn = get_connection()
        cursor = conn.cursor()

        # ------------------------------------------------------
        # 2. Get invoice + vendor information
        # ------------------------------------------------------

        cursor.execute("""
            SELECT
                i.invoice_id,
                i.vendor,
                v.vendor_name,
                v.industry,
                v.payment_terms,
                v.normal_invoice_amount,
                i.amount,
                i.invoice_date,
                i.due_date,
                i.po_number,
                i.status
            FROM invoices i
            LEFT JOIN vendors v
                ON i.vendor = v.vendor_id
            WHERE i.invoice_id = %s
        """, (invoice_id,))

        invoice_row = cursor.fetchone()

        if not invoice_row:
            raise HTTPException(
                status_code=404,
                detail=f"Invoice {invoice_id} not found"
            )

        # ------------------------------------------------------
        # 3. Create invoice information
        # ------------------------------------------------------

        invoice_information = {
            "invoice_id": invoice_row[0],
            "vendor_id": invoice_row[1],
            "vendor_name": invoice_row[2],
            "industry": invoice_row[3],
            "payment_terms": invoice_row[4],
            "normal_invoice_amount": float(invoice_row[5])
            if invoice_row[5] is not None else None,
            "amount": float(invoice_row[6])
            if invoice_row[6] is not None else None,
            "invoice_date": str(invoice_row[7])
            if invoice_row[7] is not None else None,
            "due_date": str(invoice_row[8])
            if invoice_row[8] is not None else None,
            "po_number": invoice_row[9],
            "status": invoice_row[10]
        }

        vendor_name = invoice_row[2]

        # ------------------------------------------------------
        # 4. Get discrepancy information
        # ------------------------------------------------------

        cursor.execute("""
            SELECT
                problem,
                previous_resolution
            FROM discrepancies
            WHERE invoice = %s
        """, (invoice_id,))

        discrepancy_row = cursor.fetchone()

        if discrepancy_row:

            current_issue = discrepancy_row[0]

            previous_resolution = discrepancy_row[1]

        else:

            current_issue = (
                "No discrepancy recorded for this invoice."
            )

            previous_resolution = None

        # ------------------------------------------------------
        # 5. Retrieve relevant Hindsight memories
        # ------------------------------------------------------

        hindsight_response = recall_vendor_memory(
            vendor_name,
            current_issue
        )

        hindsight_results = getattr(
            hindsight_response,
            "results",
            []
        )

        memories = []

        for result in hindsight_results:

            if isinstance(result, dict):

                memory_id = result.get(
                    "id",
                    ""
                )

                memory_type = result.get(
                    "type",
                    ""
                )

                memory_text = result.get(
                    "text",
                    str(result)
                )

            else:

                memory_id = getattr(
                    result,
                    "id",
                    ""
                )

                memory_type = getattr(
                    result,
                    "type",
                    ""
                )

                memory_text = getattr(
                    result,
                    "text",
                    str(result)
                )

            memories.append({
                "id": memory_id,
                "type": memory_type,
                "text": memory_text
            })

        # ------------------------------------------------------
        # 6. Filter memories for current vendor
        # ------------------------------------------------------

        vendor_memories = []

        if vendor_name:

            vendor_name_lower = vendor_name.lower()

            for memory in memories:

                memory_text = memory.get(
                    "text",
                    ""
                ).lower()

                if vendor_name_lower in memory_text:

                    vendor_memories.append(memory)

        # If vendor-specific memories exist,
        # use only those memories.

        if vendor_memories:

            memories = vendor_memories[:5]

        else:

            memories = memories[:5]

        # ------------------------------------------------------
        # 7. Send invoice + memory to AI agent
        # ------------------------------------------------------

        ai_result = analyze_invoice_with_ai(
            invoice=invoice_information,
            current_issue=current_issue,
            memories=memories
        )

        # ------------------------------------------------------
        # 8. Return complete result to React
        # ------------------------------------------------------

        return {
            "invoice": invoice_information,

            "current_issue": current_issue,

            "previous_resolution": previous_resolution,

            "hindsight": {
                "memory_count": len(memories),
                "memories": memories
            },

            "ai_analysis": {
                "model": MODEL,
                "agent": "Ollama",
                "recommendation": ai_result
            },

            "message": (
                f"Final AI reasoning generated by {MODEL} "
                "using relevant vendor memories retrieved "
                "from Hindsight."
            )
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Invoice analysis failed: {str(e)}"
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()
