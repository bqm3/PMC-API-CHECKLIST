module.exports = {
    apps: [
        {
            name: "api-checklist",
            script: "./index.js",           // File chạy chính
            env: {
                NODE_ENV: "production",     // Môi trường chạy
                PORT: 6868,                 // Port ứng dụng
            },
            interpreter: "node",             // Trình thông dịch Node.js
            interpreter_args: "--max-old-space-size=8192", // Tăng heap size lên 8GB và thêm cờ trace-warnings
            ignore_watch: [                 // Loại trừ các folder không cần theo dõi
                "node_modules",
                "logs",
            ],
            log_date_format: "YYYY-MM-DD HH:mm Z", // Format log có kèm timestamp
            max_memory_restart: "1G",             // Restart nếu vượt quá 1GB RAM
        }
    ],
};
