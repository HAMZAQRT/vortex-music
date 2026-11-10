import {
  Role,
} from "../generated/prisma/enums";

import {
  prisma,
} from "../lib/db/prisma";

const userId =
  process.env.TARGET_USER_ID;

const requestedRole =
  process.env.TARGET_ROLE;

const allowedRoles =
  Object.values(Role);

async function main() {
  if (!userId) {
    throw new Error(
      "TARGET_USER_ID is required",
    );
  }

  if (
    !requestedRole ||
    !allowedRoles.includes(
      requestedRole as Role,
    )
  ) {
    throw new Error(
      "TARGET_ROLE is invalid",
    );
  }

  const role =
    requestedRole as Role;

  const user =
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        role,
      },

      select: {
        id: true,
        role: true,
      },
    });

  console.log(
    "ROLE_UPDATE=OK",
  );

  console.log(
    `USER_ID=${user.id}`,
  );

  console.log(
    `ROLE=${user.role}`,
  );
}

main()
  .catch((error) => {
    console.error(
      "ROLE_UPDATE=FAILED",
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
