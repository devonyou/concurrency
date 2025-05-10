module.exports = {
    apps: [
        {
            name: 'app',
            script: 'dist/main.js',
            instances: 4,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development',
            },
        },
        {
            name: 'worker',
            script: 'dist/main.worker.js',
            instances: 4,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development',
            },
        },
    ],
};
