import { BarChart } from "@mui/x-charts";

export default function BarMini({ series, x }) {
  return (
    <BarChart
      height={200}
      series={[{ id: "b1", data: series }]}
      xAxis={[{ data: x, scaleType: "band", hide: true }]}
      yAxis={[{ hide: true }]}
      slotProps={{ legend: { hidden: true } }}
      margin={{ top: 10, left: 10, right: 10, bottom: 10 }}
    />
  );
}
