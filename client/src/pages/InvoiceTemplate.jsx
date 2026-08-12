function InvoiceTemplate({ invoice, projectTitle }) {
  const lineItems = invoice?.lineItems || [];

  const subtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.rate),
    0,
  );

  const statusColors = {
    draft: "#9CA3AF",
    sent: "#3B82F6",
    paid: "#22C55E",
    overdue: "#EF4444",
  };

  return (
    <div
      style={{
        width: "700px",
        padding: "48px",
        backgroundColor: "#ffffff",
        fontFamily: "Helvetica, Arial, sans-serif",
        color: "#1F2937",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "3px solid #1F2937",
          paddingBottom: "24px",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", margin: 0, letterSpacing: "1px" }}>
            INVOICE
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {invoice?.invoiceNumber}
          </p>
        </div>
        <div
          style={{
            padding: "6px 16px",
            borderRadius: "20px",
            backgroundColor: statusColors[invoice?.status] || "#9CA3AF",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {invoice?.status}
        </div>
      </div>

      {/* Project info */}
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#9CA3AF",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Billed For
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: "600" }}>
          {projectTitle || "—"}
        </p>
      </div>

      {/* Line items table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
            <th
              style={{
                textAlign: "left",
                padding: "8px 0",
                fontSize: "12px",
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Description
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "8px 0",
                fontSize: "12px",
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Qty
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "8px 0",
                fontSize: "12px",
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Rate
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "8px 0",
                fontSize: "12px",
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #F3F4F6" }}>
              <td style={{ padding: "12px 0", fontSize: "14px" }}>
                {item.description}
              </td>
              <td
                style={{
                  padding: "12px 0",
                  fontSize: "14px",
                  textAlign: "right",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: "12px 0",
                  fontSize: "14px",
                  textAlign: "right",
                }}
              >
                ${Number(item.rate).toFixed(2)}
              </td>
              <td
                style={{
                  padding: "12px 0",
                  fontSize: "14px",
                  textAlign: "right",
                }}
              >
                ${(Number(item.quantity) * Number(item.rate)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "240px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderTop: "2px solid #1F2937",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <span>Total</span>
            <span>${Number(invoice?.total ?? subtotal).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "48px",
          paddingTop: "16px",
          borderTop: "1px solid #E5E7EB",
          fontSize: "12px",
          color: "#9CA3AF",
          textAlign: "center",
        }}
      >
        Thank you for your business.
      </div>
    </div>
  );
}

export default InvoiceTemplate;
