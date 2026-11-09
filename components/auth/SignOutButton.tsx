import {
  signOut,
} from "../../auth";

export default function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";

        await signOut({
          redirectTo:
            "/login",
        });
      }}
    >
      <button
        type="submit"
        className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm font-black text-red-400"
      >
        Sign out
      </button>
    </form>
  );
}
