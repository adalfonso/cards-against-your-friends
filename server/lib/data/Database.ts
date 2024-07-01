import { PrismaClient } from "@prisma/client";

export class Database {
  static _instance: PrismaClient | null = null;

  public static instance() {
    if (!Database._instance) {
      return Database.init();
    }

    return Database._instance;
  }

  public static init() {
    Database._instance = new PrismaClient();

    return Database._instance;
  }

  public static async close() {
    return Database._instance?.$disconnect();
  }
}
