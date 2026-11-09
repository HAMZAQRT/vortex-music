import type {
  Session,
} from "next-auth";

import {
  getSessionRole,
  permissions,
} from "../../lib/auth/roles";

export default function AuthInspector({
  session,
}: {
  session: Session | null;
}) {
  const authenticated =
    Boolean(session?.user);

  const role =
    getSessionRole(
      session?.user,
    );

  const rolePermissions =
    permissions[role];

  return (
    <div className="space-y-4">

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        <Metric
          label="Auth"
          value={
            authenticated
              ? "SIGNED IN"
              : "SIGNED OUT"
          }
          color={
            authenticated
              ? "text-emerald-400"
              : "text-amber-400"
          }
        />

        <Metric
          label="Role"
          value={role}
          color="text-violet-400"
        />

        <Metric
          label="Provider"
          value={
            authenticated
              ? "GitHub"
              : "-"
          }
          color="text-cyan-400"
        />

        <Metric
          label="Permissions"
          value={String(
            rolePermissions.length,
          )}
          color="text-pink-400"
        />

      </section>

      <Panel title="Session">

        <Row
          label="Status"
          value={
            authenticated
              ? "Authenticated"
              : "Anonymous"
          }
        />

        <Row
          label="User ID"
          value={
            session?.user?.id ??
            "Unavailable"
          }
        />

        <Row
          label="Role"
          value={role}
        />

        <Row
          label="Name"
          value={
            session?.user?.name ??
            "Unavailable"
          }
        />

        <Row
          label="Email"
          value={
            session?.user?.email ??
            "Unavailable"
          }
        />

        <Row
          label="Session expires"
          value={
            session?.expires ??
            "Unavailable"
          }
        />

      </Panel>

      <Panel title="Permissions">

        <div className="flex flex-wrap gap-2">

          {rolePermissions.map(
            (permission) => (
              <span
                key={permission}
                className="rounded-full border border-violet-500/10 bg-violet-500/5 px-3 py-2 font-mono text-[10px] text-violet-300"
              >
                {permission}
              </span>
            ),
          )}

        </div>

      </Panel>

      <Panel title="Security">

        <Row
          label="Session strategy"
          value="JWT"
        />

        <Row
          label="OAuth provider"
          value="GitHub"
        />

        <Row
          label="Client secret exposed"
          value="No"
        />

        <Row
          label="Role source"
          value="Vortex RBAC"
        />

      </Panel>

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
        className={`mt-2 truncate font-mono text-sm font-black ${color}`}
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
  children:
    React.ReactNode;
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
