import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("Overview");

  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        vendorsResponse,
        invoicesResponse,
        discrepanciesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/vendors`),
        fetch(`${API_URL}/invoices`),
        fetch(`${API_URL}/discrepancies`),
      ]);

      if (!vendorsResponse.ok) {
        throw new Error("Failed to load vendors");
      }

      if (!invoicesResponse.ok) {
        throw new Error("Failed to load invoices");
      }

      if (!discrepanciesResponse.ok) {
        throw new Error("Failed to load discrepancies");
      }

      const vendorsData = await vendorsResponse.json();
      const invoicesData = await invoicesResponse.json();
      const discrepanciesData =
        await discrepanciesResponse.json();

      setVendors(
        Array.isArray(vendorsData) ? vendorsData : []
      );

      setInvoices(
        Array.isArray(invoicesData) ? invoicesData : []
      );

      setDiscrepancies(
        Array.isArray(discrepanciesData)
          ? discrepanciesData
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the FastAPI backend. Make sure the backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  async function analyzeInvoice(invoice) {
    try {
      setSelectedInvoice(invoice);
      setAnalysis(null);
      setAnalysisError("");
      setAnalysisLoading(true);

      const response = await fetch(
        `${API_URL}/analyze-invoice/${invoice.invoice_id}`
      );

      if (!response.ok) {
        throw new Error(
          `Analysis failed with status ${response.status}`
        );
      }

      const data = await response.json();

      setAnalysis(data);
    } catch (err) {
      console.error(err);

      setAnalysisError(
        "AI analysis could not be generated. Check Hindsight, Ollama and FastAPI."
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  function closeAnalysis() {
    setSelectedInvoice(null);
    setAnalysis(null);
    setAnalysisError("");
    setAnalysisLoading(false);
  }

  function formatAmount(amount) {
    if (amount === null || amount === undefined) {
      return "₹0";
    }

    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  function statusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("approved")) {
      return "status-approved";
    }

    if (value.includes("paid")) {
      return "status-paid";
    }

    if (value.includes("reject")) {
      return "status-rejected";
    }

    if (
      value.includes("pending") ||
      value.includes("review") ||
      value.includes("discrepancy")
    ) {
      return "status-review";
    }

    return "status-default";
  }

  function getDecision(recommendation) {
    if (!recommendation) {
      return "MANUAL REVIEW";
    }

    const text = recommendation.toUpperCase();

    if (text.includes("MANUAL REVIEW")) {
      return "MANUAL REVIEW";
    }

    if (text.includes("REJECT")) {
      return "REJECT";
    }

    if (text.includes("APPROVE")) {
      return "APPROVE";
    }

    return "MANUAL REVIEW";
  }

  function decisionClass(decision) {
    if (decision === "APPROVE") {
      return "decision-approve";
    }

    if (decision === "REJECT") {
      return "decision-reject";
    }

    return "decision-review";
  }

  const pendingCount = invoices.filter((invoice) => {
    const status = String(
      invoice.status || ""
    ).toLowerCase();

    return (
      status !== "approved" &&
      status !== "paid"
    );
  }).length;

  const navigation = [
    {
      name: "Overview",
      icon: "⌂",
    },
    {
      name: "Invoices",
      icon: "▤",
    },
    {
      name: "Exceptions",
      icon: "⚠",
    },
    {
      name: "Vendors",
      icon: "♙",
    },
    {
      name: "AI Analysis",
      icon: "✦",
    },
  ];

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            AP
          </div>

          <div>
            <div className="brand-name">
              AP Intelligence
            </div>

            <div className="brand-subtitle">
              Accounts Payable Agent
            </div>
          </div>

        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-label">
          DATA
        </div>

        <nav>

          {navigation.map((item) => (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() =>
                setActivePage(item.name)
              }
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>

            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="connection-card">

            <div className="connection-dot" />

            <div>
              <strong>
                PostgreSQL Connected
              </strong>

              <span>
                Live backend data
              </span>
            </div>

          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div className="breadcrumb">
            Accounts Payable
            <span>/</span>
            {activePage}
          </div>

          <div className="topbar-right">

            <div className="backend-status">
              <span />
              Live backend
            </div>

            <div className="avatar">
              LK
            </div>

          </div>

        </header>


        <div className="content">

          {/* ERROR */}

          {error && (
            <div className="connection-error">

              <strong>
                Backend connection problem
              </strong>

              <span>
                {error}
              </span>

              <button
                onClick={loadData}
                className="retry-button"
              >
                Retry
              </button>

            </div>
          )}


          {/* OVERVIEW */}

          {activePage === "Overview" && (
            <>

              <div className="page-heading">

                <div>

                  <h1>
                    Accounts Payable
                  </h1>

                  <p>
                    Live invoice, vendor and exception
                    data from PostgreSQL.
                  </p>

                </div>

                <div className="live-badge">
                  <span />
                  Database connected
                </div>

              </div>


              <div className="stats-grid">

                <DataCard
                  title="Invoices"
                  value={
                    loading
                      ? "..."
                      : invoices.length
                  }
                  description="PostgreSQL records"
                  icon="▤"
                />

                <DataCard
                  title="Exceptions"
                  value={
                    loading
                      ? "..."
                      : discrepancies.length
                  }
                  description="Recorded discrepancies"
                  icon="⚠"
                />

                <DataCard
                  title="Vendors"
                  value={
                    loading
                      ? "..."
                      : vendors.length
                  }
                  description="Vendor records"
                  icon="♙"
                />

                <DataCard
                  title="Pending"
                  value={
                    loading
                      ? "..."
                      : pendingCount
                  }
                  description="Not approved or paid"
                  icon="◷"
                />

              </div>


              <div className="section-card">

                <div className="section-header">

                  <div>

                    <h2>
                      Invoice Data
                    </h2>

                    <p>
                      Actual records retrieved from PostgreSQL
                    </p>

                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      setActivePage("Invoices")
                    }
                  >
                    View all →
                  </button>

                </div>

                <InvoiceTable
                  invoices={invoices.slice(0, 10)}
                  formatAmount={formatAmount}
                  statusClass={statusClass}
                  onAnalyze={analyzeInvoice}
                />

              </div>

            </>
          )}


          {/* INVOICES */}

          {activePage === "Invoices" && (
            <>

              <div className="page-heading">

                <div>

                  <h1>
                    Invoices
                  </h1>

                  <p>
                    All invoice records currently stored
                    in PostgreSQL.
                  </p>

                </div>

                <div className="data-count">
                  {invoices.length} records
                </div>

              </div>


              <div className="section-card">

                <InvoiceTable
                  invoices={invoices}
                  formatAmount={formatAmount}
                  statusClass={statusClass}
                  onAnalyze={analyzeInvoice}
                />

              </div>

            </>
          )}


          {/* EXCEPTIONS */}

          {activePage === "Exceptions" && (
            <>

              <div className="page-heading">

                <div>

                  <h1>
                    Exceptions
                  </h1>

                  <p>
                    Actual discrepancies and previous
                    resolutions stored in the database.
                  </p>

                </div>

                <div className="data-count orange-count">
                  {discrepancies.length} records
                </div>

              </div>


              <div className="section-card">

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Invoice
                        </th>

                        <th>
                          Problem
                        </th>

                        <th>
                          Previous Resolution
                        </th>

                        <th>
                          AI
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {discrepancies.map(
                        (item, index) => {

                          const invoiceId =
                            item.invoice ||
                            item.invoice_id;

                          const invoice =
                            invoices.find(
                              (inv) =>
                                inv.invoice_id ===
                                invoiceId
                            );

                          return (

                            <tr
                              key={`${invoiceId}-${index}`}
                            >

                              <td>
                                <strong className="invoice-id">
                                  {invoiceId}
                                </strong>
                              </td>

                              <td>

                                <div className="problem-cell">

                                  <span className="warning-dot">
                                    !
                                  </span>

                                  {item.problem}

                                </div>

                              </td>

                              <td>

                                <span className="resolution">
                                  {item.previous_resolution ||
                                    "No previous resolution"}
                                </span>

                              </td>

                              <td>

                                {invoice && (
                                  <button
                                    className="analyze-button"
                                    onClick={() =>
                                      analyzeInvoice(
                                        invoice
                                      )
                                    }
                                  >
                                    Analyze
                                  </button>
                                )}

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </>
          )}


          {/* VENDORS */}

          {activePage === "Vendors" && (
            <>

              <div className="page-heading">

                <div>

                  <h1>
                    Vendors
                  </h1>

                  <p>
                    Actual vendor information retrieved
                    from PostgreSQL.
                  </p>

                </div>

                <div className="data-count purple-count">
                  {vendors.length} vendors
                </div>

              </div>


              <div className="section-card">

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          ID
                        </th>

                        <th>
                          Vendor
                        </th>

                        <th>
                          Industry
                        </th>

                        <th>
                          Payment Terms
                        </th>

                        <th>
                          Normal Amount
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {vendors.map((vendor) => (

                        <tr
                          key={vendor.vendor_id}
                        >

                          <td>
                            <strong className="invoice-id">
                              {vendor.vendor_id}
                            </strong>
                          </td>

                          <td>

                            <div className="vendor-name">

                              <div className="vendor-avatar">
                                {String(
                                  vendor.vendor_name ||
                                    "V"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                {vendor.vendor_name}
                              </span>

                            </div>

                          </td>

                          <td>
                            {vendor.industry || "—"}
                          </td>

                          <td>
                            {vendor.payment_terms || "—"}
                          </td>

                          <td>
                            {formatAmount(
                              vendor.normal_invoice_amount
                            )}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </>
          )}


          {/* AI ANALYSIS */}

          {activePage === "AI Analysis" && (
            <>

              <div className="page-heading">

                <div>

                  <h1>
                    AI Invoice Analysis
                  </h1>

                  <p>
                    Select an actual invoice to retrieve
                    its Hindsight memories and generate
                    the Qwen analysis.
                  </p>

                </div>

                <div className="ai-online">
                  <span />
                  Hindsight + Qwen
                </div>

              </div>


              <div className="ai-intro">

                <div className="ai-intro-icon">
                  ✦
                </div>

                <div>

                  <h2>
                    Invoice Intelligence
                  </h2>

                  <p>
                    The information below is generated
                    from your actual invoice records,
                    Hindsight memories and Ollama/Qwen.
                  </p>

                </div>

              </div>


              <div className="section-card">

                <div className="section-header">

                  <div>

                    <h2>
                      Select an Invoice
                    </h2>

                    <p>
                      Choose an invoice from PostgreSQL
                      to run the AI agent.
                    </p>

                  </div>

                </div>


                <div className="invoice-selector">

                  {invoices.map((invoice) => (

                    <button
                      key={invoice.invoice_id}
                      className="invoice-select-card"
                      onClick={() =>
                        analyzeInvoice(invoice)
                      }
                    >

                      <div className="invoice-select-top">

                        <strong>
                          {invoice.invoice_id}
                        </strong>

                        <span
                          className={`status-badge ${statusClass(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>

                      </div>

                      <div className="invoice-select-vendor">
                        {invoice.vendor_name ||
                          invoice.vendor}
                      </div>

                      <div className="invoice-select-bottom">

                        <span>
                          {formatAmount(
                            invoice.amount
                          )}
                        </span>

                        <span>
                          Analyze →
                        </span>

                      </div>

                    </button>

                  ))}

                </div>

              </div>

            </>
          )}

        </div>

      </main>


      {/* REAL AI ANALYSIS */}

      {selectedInvoice && (

        <div
          className="modal-backdrop"
          onClick={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeAnalysis();
            }

          }}
        >

          <div className="analysis-modal">

            <div className="modal-header">

              <div>

                <div className="modal-eyebrow">
                  HINDSIGHT + QWEN
                </div>

                <h2>
                  {selectedInvoice.invoice_id}
                </h2>

                <p>
                  {selectedInvoice.vendor_name ||
                    selectedInvoice.vendor}
                </p>

              </div>

              <button
                className="close-button"
                onClick={closeAnalysis}
              >
                ×
              </button>

            </div>


            {analysisLoading && (

              <div className="analysis-loading">

                <div className="loading-orbit">
                  ✦
                </div>

                <h3>
                  Analyzing invoice
                </h3>

                <p>
                  Fetching the actual invoice data,
                  retrieving Hindsight memory and
                  generating the Qwen response.
                </p>

              </div>

            )}


            {analysisError && (

              <div className="modal-error">

                <strong>
                  Analysis failed
                </strong>

                <p>
                  {analysisError}
                </p>

              </div>

            )}


            {analysis && !analysisLoading && (

              <div className="analysis-body">


                {/* ACTUAL INVOICE */}

                <div className="analysis-section">

                  <div className="analysis-section-title">
                    Invoice
                  </div>

                  <div className="invoice-summary">

                    <div>
                      <span>
                        Vendor
                      </span>

                      <strong>
                        {analysis.invoice?.vendor_name}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Amount
                      </span>

                      <strong>
                        {formatAmount(
                          analysis.invoice?.amount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Expected
                      </span>

                      <strong>
                        {formatAmount(
                          analysis.invoice
                            ?.normal_invoice_amount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {analysis.invoice?.status}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* ACTUAL ISSUE */}

                <div className="analysis-section">

                  <div className="analysis-section-title">
                    Current Issue
                  </div>

                  <div className="issue-box">

                    <span>
                      ⚠
                    </span>

                    <p>
                      {analysis.current_issue ||
                        "No discrepancy recorded."}
                    </p>

                  </div>

                </div>


                {/* ACTUAL PREVIOUS RESOLUTION */}

                {analysis.previous_resolution && (

                  <div className="analysis-section">

                    <div className="analysis-section-title">
                      Previous Resolution
                    </div>

                    <div className="resolution-box">
                      {analysis.previous_resolution}
                    </div>

                  </div>

                )}


                {/* ACTUAL HINDSIGHT */}

                <div className="analysis-section">

                  <div className="analysis-section-title">

                    <span>
                      Hindsight Memory
                    </span>

                    <span className="memory-badge">
                      {analysis.hindsight
                        ?.memory_count || 0}{" "}
                      memories
                    </span>

                  </div>


                  {analysis.hindsight
                    ?.memories?.length > 0 ? (

                    <div className="memory-list">

                      {analysis.hindsight.memories.map(
                        (memory, index) => (

                          <div
                            className="memory-item"
                            key={
                              memory.id || index
                            }
                          >

                            <div className="memory-number">
                              {index + 1}
                            </div>

                            <div>

                              <div className="memory-type">
                                {memory.type ||
                                  "memory"}
                              </div>

                              <p>
                                {memory.text}
                              </p>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="no-memory">
                      No relevant Hindsight memory
                      was found for this invoice.
                    </div>

                  )}

                </div>


                {/* ACTUAL QWEN */}

                <div className="analysis-section">

                  <div className="analysis-section-title">
                    Qwen Recommendation
                  </div>


                  <div
                    className={`decision-banner ${decisionClass(
                      getDecision(
                        analysis.ai_analysis
                          ?.recommendation
                      )
                    )}`}
                  >

                    <div className="decision-icon">

                      {getDecision(
                        analysis.ai_analysis
                          ?.recommendation
                      ) === "APPROVE"
                        ? "✓"
                        : getDecision(
                            analysis.ai_analysis
                              ?.recommendation
                          ) === "REJECT"
                        ? "×"
                        : "!"}

                    </div>

                    <div>

                      <span>
                        AI Decision
                      </span>

                      <strong>
                        {getDecision(
                          analysis.ai_analysis
                            ?.recommendation
                        )}
                      </strong>

                    </div>

                  </div>


                  <div className="ai-reasoning">

                    <div className="reasoning-header">

                      <span>
                        Actual Qwen Response
                      </span>

                      <small>
                        {analysis.ai_analysis?.model ||
                          "qwen2.5:1.5b"}
                      </small>

                    </div>

                    <pre>
                      {analysis.ai_analysis
                        ?.recommendation ||
                        "No AI recommendation returned."}
                    </pre>

                  </div>

                </div>


              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


/* DATA CARD */

function DataCard({
  title,
  value,
  description,
  icon,
}) {
  return (

    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <div className="stat-label">
          {title}
        </div>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-note">
          {description}
        </div>

      </div>

    </div>

  );
}


/* INVOICE TABLE */

function InvoiceTable({
  invoices,
  formatAmount,
  statusClass,
  onAnalyze,
}) {

  return (

    <div className="table-wrapper">

      <table>

        <thead>

          <tr>

            <th>
              Invoice
            </th>

            <th>
              Vendor
            </th>

            <th>
              Amount
            </th>

            <th>
              Invoice Date
            </th>

            <th>
              Due Date
            </th>

            <th>
              Status
            </th>

            <th>
              AI
            </th>

          </tr>

        </thead>

        <tbody>

          {invoices.map((invoice) => (

            <tr
              key={invoice.invoice_id}
            >

              <td>

                <strong className="invoice-id">
                  {invoice.invoice_id}
                </strong>

              </td>

              <td>

                <div className="vendor-name">

                  <div className="vendor-avatar">

                    {String(
                      invoice.vendor_name ||
                        invoice.vendor ||
                        "V"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>

                  <span>
                    {invoice.vendor_name ||
                      invoice.vendor ||
                      "Unknown vendor"}
                  </span>

                </div>

              </td>

              <td>

                <strong>
                  {formatAmount(
                    invoice.amount
                  )}
                </strong>

              </td>

              <td>
                {invoice.invoice_date || "—"}
              </td>

              <td>
                {invoice.due_date || "—"}
              </td>

              <td>

                <span
                  className={`status-badge ${statusClass(
                    invoice.status
                  )}`}
                >
                  {invoice.status || "Review"}
                </span>

              </td>

              <td>

                <button
                  className="analyze-button"
                  onClick={() =>
                    onAnalyze(invoice)
                  }
                >
                  ✦ Analyze
                </button>

              </td>

            </tr>

          ))}


          {invoices.length === 0 && (

            <tr>

              <td
                colSpan="7"
                className="empty-state"
              >
                No invoice data found.
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  );
}

export default App;