"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useDebug } from "../../context/DebugContext";

export default function WebVitalsMonitor() {
  const { log } = useDebug();

  useReportWebVitals((metric) => {
    log(
      "system",
      `Web Vital: ${metric.name}`,
      {
        id: metric.id,
        value: metric.value,
        rating: metric.rating,
      },
    );
  });

  return null;
}
