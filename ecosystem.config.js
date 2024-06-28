

module.exports = {
    apps: [
        {
            name: "api-checklist",
            script: "./index.js",
            env: {
                NODE_ENV: 'production',
                PORT: 6868
            }
        }
    ]
}