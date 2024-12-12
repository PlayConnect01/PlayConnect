require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

// Create a Prisma client instance
const prisma = new PrismaClient();

module.exports =  prisma;
