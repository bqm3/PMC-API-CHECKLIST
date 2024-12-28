module.exports = {
    apps: [
        {
            name: "api-checklist",
            script: "./index.js",
            env: {
                NODE_ENV: 'production',
                PORT: 6868
            },
            node_args: "--max-old-space-size=4096" // Tăng heap size lên 4GB
        }
    ]
}
