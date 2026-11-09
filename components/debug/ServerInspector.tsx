"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useDebug,
} from "../../context/DebugContext";

type SystemResponse = {
  ok: boolean;

  service: {
    name: string;
    framework: string;
  };

  runtime: {
    node: string;
    platform: string;
    architecture: string;
    environment: string;
    uptimeSeconds: number;
  };

  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };

  timestamp: string;
};

type Status =
  | "idle"
  | "loading"
  | "healthy"
  | "error";

function mb(bytes: number) {
  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`;
}

function uptime(
  seconds: number,
) {
  const hours =
    Math.floor(
      seconds / 3600,
    );

  const minutes =
    Math.floor(
      (seconds % 3600) /
        60,
    );

  const remaining =
    seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remaining}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remaining}s`;
  }

  return `${remaining}s`;
}

export default function ServerInspector() {
  const {
    log,
  } = useDebug();

  const [data, setData] =
    useState<SystemResponse | null>(
      null,
    );

  const [status, setStatus] =
    useState<Status>("idle");

  const [latency, setLatency] =
    useState<number | null>(
      null,
    );

  async function probe() {
    setStatus("loading");

    const started =
      performance.now();

    try {
      const response =
        await fetch(
          "/api/debug/system",
          {
            cache: "no-store",
          },
        );

      const duration =
        performance.now() -
        started;

      setLatency(duration);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`,
        );
      }

      const payload =
        (await response.json()) as SystemResponse;

      setData(payload);

      setStatus(
        payload.ok
          ? "healthy"
          : "error",
      );

      log(
        "network",
        "SERVER_HEALTH",
        {
          ok: payload.ok,
          node:
            payload.runtime.node,
          latencyMs:
            Math.round(
              duration,
            ),
        },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      setStatus("error");

      log(
        "error",
        "Server diagnostic probe failed",
        {
          error: message,
        },
      );
    }
  }

  useEffect(() => {
    let active = true;

    Promise.resolve().then(async () => {
      if (!active) {
        return;
      }

      const started =
        performance.now();

      try {
        const response =
          await fetch(
            "/api/debug/system",
            {
              cache: "no-store",
            },
          );

        const duration =
          performance.now() -
          started;

        if (!active) {
          return;
        }

        setLatency(duration);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`,
          );
        }

        const payload =
          (await response.json()) as SystemResponse;

        if (!active) {
          return;
        }

        setData(payload);

        setStatus(
          payload.ok
            ? "healthy"
            : "error",
        );

        log(
          "network",
          "SERVER_HEALTH_AUTO",
          {
            ok: payload.ok,
            node:
              payload.runtime.node,
            latencyMs:
              Math.round(
                duration,
              ),
          },
        );
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setStatus("error");

        log(
          "error",
          "Automatic server diagnostic probe failed",
          {
            error: message,
          },
        );
      }
    });

    return () => {
      active = false;
    };
  }, [log]);

  const memoryPercent =
    data &&
    data.memory.heapTotal >
      0
      ? Math.round(
          (data.memory.heapUsed /
            data.memory.heapTotal) *
            100,
        )
      : 0;

  return (
    <div className="space-y-4">

      <section className="rounded-3xl border border-white/5 bg-[#111116] p-4">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Server Health
            </p>

            <h2 className="mt-1 text-xl font-black">
              Vortex Web Runtime
            </h2>
          </div>

          <StatusBadge
            status={status}
          />

        </div>

        <button
          onClick={() =>
            void probe()
          }
          disabled={
            status ===
            "loading"
          }
          className="mt-5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-black disabled:opacity-40"
        >
          Probe server
        </button>

      </section>

      {data && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <Metric
              label="Latency"
              value={
                latency !== null
                  ? `${Math.round(
                      latency,
                    )}ms`
                  : "-"
              }
              color="text-cyan-400"
            />

            <Metric
              label="Uptime"
              value={uptime(
                data.runtime
                  .uptimeSeconds,
              )}
              color="text-emerald-400"
            />

            <Metric
              label="Heap"
              value={`${memoryPercent}%`}
              color={
                memoryPercent >
                80
                  ? "text-red-400"
                  : memoryPercent >
                      60
                    ? "text-amber-400"
                    : "text-violet-400"
              }
            />

            <Metric
              label="Runtime"
              value={
                data.runtime.node
              }
              color="text-white"
            />

          </section>

          <Panel title="Runtime">

            <Row
              label="Service"
              value={
                data.service.name
              }
            />

            <Row
              label="Framework"
              value={
                data.service.framework
              }
            />

            <Row
              label="Node"
              value={
                data.runtime.node
              }
            />

            <Row
              label="Platform"
              value={
                data.runtime.platform
              }
            />

            <Row
              label="Architecture"
              value={
                data.runtime
                  .architecture
              }
            />

            <Row
              label="Environment"
              value={
                data.runtime
                  .environment
              }
            />

            <Row
              label="Server uptime"
              value={uptime(
                data.runtime
                  .uptimeSeconds,
              )}
            />

          </Panel>

          <Panel title="Memory">

            <Row
              label="RSS"
              value={mb(
                data.memory.rss,
              )}
            />

            <Row
              label="Heap total"
              value={mb(
                data.memory
                  .heapTotal,
              )}
            />

            <Row
              label="Heap used"
              value={mb(
                data.memory
                  .heapUsed,
              )}
            />

            <Row
              label="External"
              value={mb(
                data.memory
                  .external,
              )}
            />

            <Row
              label="Array buffers"
              value={mb(
                data.memory
                  .arrayBuffers,
              )}
            />

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">

              <div
                className={`h-full rounded-full ${
                  memoryPercent >
                  80
                    ? "bg-red-500"
                    : memoryPercent >
                        60
                      ? "bg-amber-500"
                      : "bg-violet-500"
                }`}
                style={{
                  width: `${Math.min(
                    memoryPercent,
                    100,
                  )}%`,
                }}
              />

            </div>

          </Panel>

          <Panel title="Last Probe">

            <Row
              label="Server timestamp"
              value={
                data.timestamp
              }
            />

            <Row
              label="HTTP/API"
              value={
                data.ok
                  ? "Healthy"
                  : "Unhealthy"
              }
            />

          </Panel>
        </>
      )}

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const classes = {
    idle:
      "bg-white/5 text-white/40",

    loading:
      "bg-amber-500/10 text-amber-400",

    healthy:
      "bg-emerald-500/10 text-emerald-400",

    error:
      "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-2 text-xs font-black uppercase ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#111116] p-4">

      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
        {label}
      </p>

      <p
        className={`mt-2 truncate font-mono text-lg font-black ${color}`}
      >
        {value}
      </p>

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

      <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-violet-400">
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

      <span className="max-w-[65%] truncate text-right font-mono text-xs text-white/75">
        {value}
      </span>

    </div>
  );
}
