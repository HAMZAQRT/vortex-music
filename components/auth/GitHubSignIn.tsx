import {
  signIn,
} from "../../auth";

export default function GitHubSignIn() {
  return (
    <form
      action={async () => {
        "use server";

        await signIn(
          "github",
          {
            redirectTo:
              "/account",
          },
        );
      }}
    >
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/90"
      >
        <span className="text-lg">
          ◉
        </span>

        Continue with GitHub
      </button>
    </form>
  );
}
