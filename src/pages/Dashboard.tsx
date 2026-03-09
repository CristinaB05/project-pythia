import { useState } from "react";
import StockChart from "../components/StockChart";
import FinbertSentimentChart from "../components/FinbertChart";
import GainLossChart from "../components/GainLossChart";
import CommulativeChart from "../components/CommulativGainLoss";

const cardStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

const Dashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState("AAPL");

  return (
   <div style={{ padding: "30px", fontFamily: "Arial" }}>
  <h1 style={{ marginBottom: "20px" }}>📈 Stock Dashboard</h1>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
    width: "100%"
  }}
>
  <label
    htmlFor="companySelect"
    style={{
      fontWeight: "600",
      fontSize: "14px",
      color: "#555",
      whiteSpace: "nowrap"
    }}
  >
    Select Company Stock :
  </label>

  <select
    id="companySelect"
    value={selectedCompany}
    onChange={(e) => setSelectedCompany(e.target.value)}
    style={{
      padding: "10px",
      fontSize: "16px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      cursor: "pointer"
    }}
  >
    <option value="AAPL">Apple</option>
    <option value="ORCL">Oracle</option>
    <option value="SAP">SAP</option>
  </select>
</div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "30px"
    }}
  >
    <div style={cardStyle}>
      <StockChart company={selectedCompany} />
    </div>

    <div style={cardStyle}>
      <FinbertSentimentChart company={selectedCompany} />
    </div>

    <div style={cardStyle}>
      <GainLossChart company={selectedCompany} />
    </div>

    <div style={cardStyle}>
      <CommulativeChart company={selectedCompany} />
    </div>
  </div>
</div>
  );
};

export default Dashboard;