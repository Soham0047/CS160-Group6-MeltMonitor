import { BarChart } from "@mui/x-charts/BarChart";

export default function BarMini({ x, series }) {
  return (
    <BarChart
      xAxis={[{ data: x, scaleType: "band" }]}
      series={[
        {
          data: series,
          color: "#667eea",
        },
      ]}
      height={150}
      margin={{ top: 10, bottom: 20, left: 40, right: 10 }}
      sx={{
        "& .MuiChartsAxis-tickLabel": {
          fontSize: 10,
        },
      }}
    />
  );
}
