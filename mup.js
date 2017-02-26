module.exports = {
  servers: {
    one: {
      host: '52.175.221.181',
      username: 'azureuser',
      // pem:
      password: 'Azurepassword.'
      // or leave blank for authenticate from ssh-agent
    }
  },
  "setupMongo": false,
  "setupNode": true,
  "enableUploadProgressBar": true,

  meteor: {
    name: 'filenamer',
    path: '../filenamer',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
    },
    env: {
      PORT: 80,
      ROOT_URL: 'http://filenamer.cloudapp.net/',
      MONGO_URL: 'mongodb://admin:admin@ds058369.mlab.com:58369/filenamer'
    },
    dockerImage: 'abernix/meteord:base',
    //dockerImage: 'kadirahq/meteord'
    deployCheckWaitTime: 60
  }
};
