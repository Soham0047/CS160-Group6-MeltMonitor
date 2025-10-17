import { LineChart } from "@mui/x-charts";

// Minimal sparkline (hidden legend/axes for clarity)
export default function SparkLine({ series, x }) {
  return (
    <LineChart
      height={200}
      series={[{ id: "s1", data: series }]}
      xAxis={[{ data: x, scaleType: "point", hide: true }]}
      yAxis={[{ hide: true }]}
      grid={{ horizontal: false, vertical: false }}
      slotProps={{ legend: { hidden: true } }}
      margin={{ top: 10, left: 10, right: 10, bottom: 10 }}
    />
  );
}
