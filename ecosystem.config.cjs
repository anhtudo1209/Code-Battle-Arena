module.exports = {
    apps: [
        {
            name: "code-battle-backend",
            script: "./backend/src/app.js",
            env: {
                NODE_ENV: "production", m
            },
        },
        {
            name: "code-battle-worker",
            script: "./backend/src/worker.js",
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "code-battle-match-worker",
            script: "./backend/src/matchWorker.js",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
