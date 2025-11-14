import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // PostgreSQL
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    TARGET_SCHEMA: process.env.TARGET_SCHEMA,
    
    // MySQL (for chat history)
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    
    // Email Service
    EMAIL_ESP_PROVIDER: process.env.EMAIL_ESP_PROVIDER,
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
    
    // AI APIs
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

export default nextConfig;
