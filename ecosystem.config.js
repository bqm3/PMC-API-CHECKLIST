

module.exports = {
    apps: [
        {
            name: "CHECKLIST",
            script: "./index.js",
            env: {
                NODE_ENV: 'production',
                PORT: 6868
            }
        }
    ]
}