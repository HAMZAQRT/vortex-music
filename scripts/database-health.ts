import {
  prisma,
} from "../lib/db/prisma";

async function main() {
  const users =
    await prisma.user.count();

  const accounts =
    await prisma.account.count();

  console.log(
    "DATABASE_HEALTH=OK",
  );

  console.log(
    `USERS=${users}`,
  );

  console.log(
    `ACCOUNTS=${accounts}`,
  );
}

main()
  .catch((error) => {
    console.error(
      "DATABASE_HEALTH=FAILED",
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
