const config = require('../configs/config-dockerBridge.json');
const axios = require('axios').default;
const querystring = require('querystring');
let token = null;

function auth() {
    let data = JSON.stringify({
        'username': config.portainer.username,
        'password': config.portainer.password
    })
    return axios.post(config.portainer.fqdn + ':' + config.portainer.port + '/api/auth', data)
    // .then(function (response) {
    //     console.log(response);
    //     return this.response;
    // })
    // .catch(function (error) {
    //     console.log(error);
    // });
}

exports.query = async function querySyno(payload, path,post) {
    if (!path) {
        path = '/webapi/entry.cgi';
    }
    if (!token) {
        const authToken = await auth();
        if (authToken.status === 200) {
            token = authToken.data.jwt;
        }
    }

    let result = null;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}` 
    if(post){
        result = await axios.post(config.portainer.fqdn + ':' + config.portainer.port + path);
    }else{
        result = await axios.get(config.portainer.fqdn + ':' + config.portainer.port + path);
    }
 
    if (result.status === 200 || result.status === 204) {
        return result.data;
    }
    else {
        console.log('Failed while querying ' + config.portainer.fqdn + ' at ' + path);
    }
}
