import pkg from "@prisma/client";
// @ts-ignore 
const prismaClient = pkg.PrismaClient;

const prisma = new prismaClient();

export default prisma;