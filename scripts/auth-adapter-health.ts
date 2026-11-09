import {
  PrismaAdapter,
} from "@auth/prisma-adapter";

import {
  prisma,
} from "../lib/db/prisma";

async function main() {
  const adapter =
    PrismaAdapter(prisma);

  if (!adapter.getUserByEmail) {
    throw new Error(
      "Prisma adapter getUserByEmail is unavailable",
    );
  }

  await adapter.getUserByEmail(
    "vortex-health-check@example.invalid",
  );

  console.log(
    "AUTH_PRISMA_ADAPTER=OK",
  );
}

main()
  .catch((error) => {
    console.error(
      "AUTH_PRISMA_ADAPTER=FAILED",
    );

    console.error(
      error instanceof Error
        ? error.message
        : String(error),
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
