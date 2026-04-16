module.exports = {
    apps : [
        {
            name: "backend-service",
            script: "dist/server.js",
            watch: true,
            env: {
                "PORT": 80,
                "NODE_ENV": "production",
                "SIGNING_SECRET": "my_super_secret_key",

                "API_URL": "https://agent.thejaminitiative.co.uk/api/v1/chat/completions",
                "API_KEY": "G--fzuAMfwBczyfn2bzmPC8Va5VG49Mt",

                "FRESHSALES_API_KEY": "",
                "FRESHSALES_DOMAIN": "projectjam.myfreshworks.com",

                "ELASTIC_STORE_LOCAL" : "http://10.106.0.2:9200",

                "STRIPE_BASE_URL" : "https://api.stripe.com",
                "STRIPE_SECRET_KEY" : "",
                "STRIPE_PUBLISH_KEY" : "",
                "STRIPE_WEBHOOK_SIGNING_KEY" : ""
            }
        }
    ]
}