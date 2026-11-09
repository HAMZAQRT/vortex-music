"use client";

import {
  useState,
} from "react";

import {
  useDebug,
} from "../../context/DebugContext";

type RequestRecord = {
  id: string;
  method: "GET" | "POST";
  url: string;
  status: number;
  ok: boolean;
  duration: number;
  size: number;
  timestamp: number;
  response: string;
};

export default function NetworkInspector() {
  const {
    log,
  } = useDebug();

  const [requests, setRequests] =
    useState<RequestRecord[]>([]);

  const [running, setRunning] =
    useState(false);

  async function executeRequest(
    method: "GET" | "POST",
  ) {
    if (running) {
      return;
    }

    setRunning(true);

    const url =
      "/api/debug/health";

    const started =
      performance.now();

    log(
      "network",
      `${method} ${url} started`,
    );

    try {
      const response =
        await fetch(
          url,
          method === "POST"
            ? {
                method,
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  source:
                    "Vortex Debug Network Inspector",
                  timestamp:
                    Date.now(),
                }),
              }
            : {
                method,
                cache: "no-store",
              },
        );

      const text =
        await response.text();

      const duration =
        performance.now() -
        started;

      const size =
        new Blob([text]).size;

      const record: RequestRecord = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

        method,
        url,
        status: response.status,
        ok: response.ok,
        duration,
        size,
        timestamp: Date.now(),
        response: text,
      };

      setRequests(
        (current) =>
          [
            record,
            ...current,
          ].slice(0, 50),
      );

      log(
        "network",
        `${method} ${url} ${response.status}`,
        {
          status:
            response.status,
          ok:
            response.ok,
          durationMs:
            Math.round(duration),
          responseBytes:
            size,
        },
      );
    } catch (error) {
      const duration =
        performance.now() -
        started;

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      const record: RequestRecord = {
        id: `${Date.now()}-error`,

        method,
        url,
        status: 0,
        ok: false,
        duration,
        size: 0,
        timestamp: Date.now(),
        response: message,
      };

      setRequests(
        (current) =>
          [
            record,
            ...current,
          ].slice(0, 50),
      );

      log(
        "error",
        `${method} ${url} failed`,
        {
          durationMs:
            Math.round(duration),
          error:
            message,
        },
      );
    } finally {
      setRunning(false);
    }
  }

  function clearRequests() {
    setRequests([]);
  }

  const successCount =
    requests.filter(
      (request) =>
        request.ok,
    ).length;

  const failedCount =
    requests.length -
    successCount;

  const averageLatency =
    requests.length > 0
      ? Math.round(
          requests.reduce(
            (
              total,
              request,
            ) =>
              total +
              request.duration,
            0,
          ) /
            requests.length,
        )
      : 0;

  return (
    <div className="space-y-4">

      <section className="grid grid-cols-3 gap-3">
        <Metric
          label="Requests"
          value={String(
            requests.length,
          )}
          color="text-cyan-400"
        />

        <Metric
          label="Failures"
          value={String(
            failedCount,
          )}
          color={
            failedCount > 0
              ? "text-red-400"
              : "text-emerald-400"
          }
        />

        <Metric
          label="Avg latency"
          value={
            requests.length
              ? `${averageLatency}ms`
              : "-"
          }
          color="text-violet-400"
        />
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#111116] p-4">

        <div className="flex flex-wrap items-start justify-between gap-3">

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
              API Probe
            </p>

            <h2 className="mt-1 text-lg font-black">
              Vortex Health Endpoint
            </h2>

            <p className="mt-1 font-mono text-xs text-white/30">
              /api/debug/health
            </p>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-xs font-black ${
              running
                ? "bg-amber-500/10 text-amber-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {running
              ? "RUNNING"
              : "READY"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">

          <button
            onClick={() =>
              executeRequest(
                "GET",
              )
            }
            disabled={running}
            className="rounded-full bg-cyan-600 px-5 py-2 text-xs font-black disabled:opacity-40"
          >
            Run GET
          </button>

          <button
            onClick={() =>
              executeRequest(
                "POST",
              )
            }
            disabled={running}
            className="rounded-full bg-violet-600 px-5 py-2 text-xs font-black disabled:opacity-40"
          >
            Run POST
          </button>

          <button
            onClick={
              clearRequests
            }
            className="rounded-full border border-white/10 px-5 py-2 text-xs font-black text-white/50"
          >
            Clear
          </button>

        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#111116] p-4">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-orange-400">
              Request Timeline
            </p>

            <h2 className="mt-1 text-lg font-black">
              Network Activity
            </h2>
          </div>

          <span className="font-mono text-xs text-white/30">
            {requests.length}/50
          </span>
        </div>

        <div className="mt-4 space-y-3">

          {requests.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-7 text-center">
              <p className="text-sm text-white/30">
                Run an API probe to capture network activity.
              </p>
            </div>
          ) : (
            requests.map(
              (request) => (
                <article
                  key={
                    request.id
                  }
                  className="rounded-2xl border border-white/5 bg-black/30 p-3"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-2">

                      <span
                        className={`rounded-md px-2 py-1 font-mono text-[10px] font-black ${
                          request.method ===
                          "GET"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-violet-500/10 text-violet-400"
                        }`}
                      >
                        {
                          request.method
                        }
                      </span>

                      <span className="font-mono text-xs text-white/55">
                        {
                          request.url
                        }
                      </span>

                    </div>

                    <span
                      className={`font-mono text-xs font-black ${
                        request.ok
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {
                        request.status
                      }
                    </span>

                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">

                    <SmallMetric
                      label="Time"
                      value={`${Math.round(
                        request.duration,
                      )} ms`}
                    />

                    <SmallMetric
                      label="Size"
                      value={`${request.size} B`}
                    />

                    <SmallMetric
                      label="When"
                      value={new Date(
                        request.timestamp,
                      ).toLocaleTimeString()}
                    />

                  </div>

                  <details className="mt-3">

                    <summary className="cursor-pointer text-xs font-bold text-white/35">
                      Response body
                    </summary>

                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-black/40 p-3 font-mono text-[10px] leading-5 text-white/45">
                      {
                        request.response
                      }
                    </pre>

                  </details>

                </article>
              ),
            )
          )}

        </div>
      </section>

    </div>
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
        className={`mt-2 font-mono text-xl font-black ${color}`}
      >
        {value}
      </p>

    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-2">

      <p className="text-[9px] uppercase text-white/20">
        {label}
      </p>

      <p className="mt-1 truncate font-mono text-[10px] text-white/60">
        {value}
      </p>

    </div>
  );
}
