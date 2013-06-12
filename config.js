module.exports = {
  production: {
    redisStore: {
      host:'localhost', 
      db: 1, 
      pass: 'redis_password'
    }, 
    sessionSecret: 'session_secret',
    dbURL: 'mongodb://localhost/oauth2-server',
  },
  development : {
    sessionSecret: "1234567890",
    dbURL: 'mongodb://localhost/dev-oauth2-server',
  }
  
}
