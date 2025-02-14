module.exports = {
  apps: [
    {
      name: "api-checklist",
      script: "./index.js",
      watch: false, // có file( ảnh) thay đổi ở trong cấu hình thì sẽ kết hợp với autoreset: true để reset lại server: Không nên sử dụng true
      autorestart: true, // Server lỗi sẽ tự động reload
      max_restarts: 5,
      restart_delay: 10000,
      env: {
        NODE_ENV: "production",
        PORT: 6868,
      },
      node_args: "--max-old-space-size=4096", // Tăng heap size lên 4GB
    },
  ],
};
