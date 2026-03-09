import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
} from "recharts";

interface StockData {
  "Date Time": string;
  CumulativeGainLoss: number;
  timestamp: number;
}

interface Props {
  company: string;
}

const CommulativeChart = ({ company }: Props) => {
  const [data, setData] = useState<StockData[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  const [refStartTime, setRefStartTime] = useState<number | null>(null);
  const [refEndTime, setRefEndTime] = useState<number | null>(null);

  // Load CSV and convert date to timestamp
  useEffect(() => {
    fetch(`/data/${company}.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        const result = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        const filtered = (result.data as StockData[])
          .filter((row) => row["Date Time"] && row.CumulativeGainLoss != null)
          .sort(
            (a, b) =>
              new Date(a["Date Time"]).getTime() -
              new Date(b["Date Time"]).getTime()
          )
          .map((row) => ({
            ...row,
            timestamp: new Date(row["Date Time"]).getTime(),
          }));

        setData(filtered);
        setStartIndex(0);
        setEndIndex(filtered.length - 1);
      });
  }, [company]);

  // Drag-to-zoom handler
  const handleZoom = () => {
    if (refStartTime === null || refEndTime === null) return;

    const minTime = Math.min(refStartTime, refEndTime);
    const maxTime = Math.max(refStartTime, refEndTime);

    const newStartIndex = data.findIndex((d) => d.timestamp >= minTime);
    const newEndIndex = data.findIndex((d) => d.timestamp >= maxTime);

    setStartIndex(newStartIndex !== -1 ? newStartIndex : 0);
    setEndIndex(newEndIndex !== -1 ? newEndIndex : data.length - 1);

    setRefStartTime(null);
    setRefEndTime(null);
  };

  const resetZoom = () => {
    setStartIndex(0);
    setEndIndex(data.length - 1);
  };

  // Generate X-axis ticks dynamically
  const generateXTicks = (data: StockData[], start: number, end: number) => {
    if (!data.length) return [];
    const visible = data.slice(start, end + 1);
    const totalPoints = visible.length;
    const maxTicks = 12;
    const step = Math.ceil(totalPoints / maxTicks);
    const middleTicks = visible.filter((_, i) => i % step === 0).map(d => d.timestamp);
    return [
      visible[0].timestamp,
      ...middleTicks.filter(
        t => t !== visible[0].timestamp && t !== visible[visible.length - 1].timestamp
      ),
      visible[visible.length - 1].timestamp,
    ];
  };

  return (
    <div onDoubleClick={resetZoom}>
      <ResponsiveContainer width="100%" height={450}>
        <AreaChart
          data={data}
          onMouseDown={(e) => { if (e?.activeLabel) setRefStartTime(Number(e.activeLabel)); }}
          onMouseMove={(e) => { if (refStartTime !== null && e?.activeLabel) setRefEndTime(Number(e.activeLabel)); }}
          onMouseUp={handleZoom}
        >
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />

          {/* X-axis */}
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            ticks={generateXTicks(data, startIndex, endIndex)}
            tickFormatter={(time) =>
              new Date(time).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
            }
            label={{
              value: "Date (Month / Year)",
              position: "insideBottom",
              offset: -10,
              style: { fontWeight: "bold", fontSize: 14, fill: "#555" }
            }}
          />

          {/* Y-axis */}
          <YAxis
            label={{
              value: "Cumulative Gain / Loss",
              angle: -90,
              position: "insideLeft",
              style: { fontWeight: "bold", fontSize: 14, fill: "#555" }
            }}
          />

          <Tooltip
            labelFormatter={(label) =>
              typeof label === "number"
                ? new Date(label).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
                : label
            }
          />

          <Legend verticalAlign="top" align="center" />

          {/* Area */}
          <Area
            type="monotone"
            dataKey="CumulativeGainLoss"
            name="Cumulative Directional Performance"
            stroke="#1976d2"
            fill="url(#colorGainLoss)"
            strokeWidth={3}
            dot={false}
          />

          {/* Drag selection */}
          {refStartTime !== null && refEndTime !== null && (
            <ReferenceArea x1={refStartTime} x2={refEndTime} strokeOpacity={0.3} fill="#8884d8" />
          )}

          {/* Brush */}
          <Brush
            dataKey="timestamp"
            height={35}
            startIndex={startIndex}
            endIndex={endIndex}
            stroke="#8884d8"
            travellerWidth={10}
            tickFormatter={(time) =>
              new Date(time).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
            }
            onChange={(e) => {
              if (e?.startIndex !== undefined && e?.endIndex !== undefined) {
                setStartIndex(e.startIndex);
                setEndIndex(e.endIndex);
              }
            }}
          />

          {/* Gradient fill */}
          <defs>
            <linearGradient id="colorGainLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1976d2" stopOpacity={0.4} />
              <stop offset="75%" stopColor="#1976d2" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommulativeChart;