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
    ],
};
