module.exports = {
    apps: [{
        name: "agristellar-fe",
        script: "npm run preview",
        watch: ["./"],
        // Delay between restart
        watch_delay: 1000,
        ignore_watch: ["node_modules", "client/img", "\\.git", "*.log"],
    }]
}