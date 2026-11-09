"use client";

import {
  useEffect,
  useState,
} from "react";

type PerformanceData = {
  pageLoad: number | null;
  domComplete: number | null;
  dns: number | null;
  tcp: number | null;
  response: number | null;
  resources: number;
  memoryUsed: string;
  memoryLimit: string;
  effectiveType: string;
  downlink: string;
  rtt: string;
};

type ExtendedPerformance = Performance & {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

type ExtendedNavigator = Navigator & {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
};

const initialData: PerformanceData = {
  pageLoad: null,
  domComplete: null,
  dns: null,
  tcp: null,
  response: null,
  resources: 0,
  memoryUsed: "Unavailable",
  memoryLimit: "Unavailable",
  effectiveType: "Unavailable",
  downlink: "Unavailable",
  rtt: "Unavailable",
};

function milliseconds(
  value: number | null,
) {
  if (value === null) {
    return "Unavailable";
  }

  return `${Math.max(
    0,
    Math.round(value),
  )} ms`;
}

function bytesToMB(bytes: number) {
  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`;
}

export default function PerformanceInspector() {
  const [data, setData] =
    useState<PerformanceData>(
      initialData,
    );

  useEffect(() => {
    function collect() {
      const navigation =
        performance.getEntriesByType(
          "navigation",
        )[0] as
          | PerformanceNavigationTiming
          | undefined;

      const extendedPerformance =
        performance as ExtendedPerformance;

      const extendedNavigator =
        navigator as ExtendedNavigator;

      const memory =
        extendedPerformance.memory;

      const connection =
        extendedNavigator.connection;

      setData({
        pageLoad: navigation
          ? navigation.loadEventEnd -
            navigation.startTime
          : null,

        domComplete: navigation
          ? navigation.domComplete -
            navigation.startTime
          : null,

        dns: navigation
          ? navigation.domainLookupEnd -
            navigation.domainLookupStart
          : null,

        tcp: navigation
          ? navigation.connectEnd -
            navigation.connectStart
          : null,

        response: navigation
          ? navigation.responseEnd -
            navigation.responseStart
          : null,

        resources:
          performance.getEntriesByType(
            "resource",
          ).length,

        memoryUsed: memory
          ? bytesToMB(
              memory.usedJSHeapSize,
            )
          : "Unavailable",

        memoryLimit: memory
          ? bytesToMB(
              memory.jsHeapSizeLimit,
            )
          : "Unavailable",

        effectiveType:
          connection?.effectiveType ||
          "Unavailable",

        downlink:
          connection?.downlink !== undefined
            ? `${connection.downlink} Mbps`
            : "Unavailable",

        rtt:
          connection?.rtt !== undefined
            ? `${connection.rtt} ms`
            : "Unavailable",
      });
    }

    collect();

    const interval =
      window.setInterval(
        collect,
        5000,
      );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4">
      <Panel title="Navigation Timing">
        <Row
          label="Page load"
          value={milliseconds(
            data.pageLoad,
          )}
        />

        <Row
          label="DOM complete"
          value={milliseconds(
            data.domComplete,
          )}
        />

        <Row
          label="DNS"
          value={milliseconds(
            data.dns,
          )}
        />

        <Row
          label="TCP"
          value={milliseconds(
            data.tcp,
          )}
        />

        <Row
          label="Response"
          value={milliseconds(
            data.response,
          )}
        />
      </Panel>

      <Panel title="Runtime">
        <Row
          label="Resources loaded"
          value={String(
            data.resources,
          )}
        />

        <Row
          label="JS heap used"
          value={data.memoryUsed}
        />

        <Row
          label="JS heap limit"
          value={data.memoryLimit}
        />
      </Panel>

      <Panel title="Network">
        <Row
          label="Connection"
          value={
            data.effectiveType
          }
        />

        <Row
          label="Downlink"
          value={data.downlink}
        />

        <Row
          label="RTT"
          value={data.rtt}
        />
      </Panel>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/5 bg-[#111116] p-4">
      <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-cyan-400">
        {title}
      </h2>

      {children}
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.04] py-3 last:border-0">
      <span className="text-xs text-white/35">
        {label}
      </span>

      <span className="font-mono text-xs text-white/80">
        {value}
      </span>
    </div>
  );
}
