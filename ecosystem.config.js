module.exports = {
    apps: [
        {
            name: "api-checklist",
            script: "./index.js", // Đường dẫn chính xác tới file chạy ứng dụng
            env: {
                NODE_ENV: 'production', // Môi trường chạy
                PORT: 6868,            // Port của ứng dụng
            },
            interpreter: "node",      // Đảm bảo sử dụng Node.js
            interpreter_args: "--max-old-space-size=8192", // Tăng heap size lên 8GB
            watch: true,             // Tự động restart khi có thay đổi file
        }
    ]
};
