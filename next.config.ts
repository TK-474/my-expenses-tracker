import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The Expenses ledger became the Transactions ledger (income + expenses)
      { source: "/expenses", destination: "/transactions", permanent: true },
    ];
  },
};

export default nextConfig;
