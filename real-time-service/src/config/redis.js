const Redis = require("ioredis");

class RedisClient {
  constructor() {
    this.client = null;
  }

  connect() {
    try {
      this.client = new Redis(
        process.env.REDIS_URL || "redis://localhost:6379"
      );

      this.client.on("connect", () => {
        console.log("Connected to Redis");
      });

      this.client.on("error", (err) => {
        console.error("Redis connection error:", err);
      });

      return this.client;
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  }

  getClient() {
    if (!this.client) {
      this.connect();
    }
    return this.client;
  }
}

module.exports = new RedisClient();
