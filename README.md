# Portainer  HomeKit Bridge

This project aims to provide a fully functional Portainer Docker Bridge that allows users to stop/start docker container
through using Portainer API.

Currently it has the following features:

| Feature                  | Accessory Type         | Description                                           | Status      |
|      ---                 |        ---             |              ---                                      |     ---     |
| Start/Stop container     | Switch sensor          | Lets you start/stop containers                        | Done        |
| Container CPU usage      | Property on the Switch |  displays container CPU usage in relation to the host | Planned     |
| Container MEMORY usage   | Property on the Switch |  displays container MEMORY usage in relation to the host | Planned     |
| Container Uptime         | Property on the Switch |  displays container UpTime                            | Planned     |

Keep in mind this is an early project that still has a number of bugs o be ironed out and exceptions to be handled.
Tha being said is fully functional for what it is.

##  Docker - HOWTO :D
You can launch the container after building the image following the instructions below or by pulling it from dockerhub.

Keep in mind that to achieve Accessory persistancy on HomeKit you have to map a folder on your server to the path /persist
in the container.

Docker launch example using dockerhub image:

```
docker run -dt --name Portainer-HomeKitBridge \
-v /path_on_your_server/YOUR_CONTAINER_NAME/config-dockerBridge.json:/configs/config-dockerBridge.json \
-v /path_on_your_server/YOUR_CONTAINER_NAME/accessories:/persist \
--network host \
munhozdiego/portainerhkb:latest
```

***Config file example, it needs to be mapped under /configs/config-DockerBridge.json***
```
{
  "bridge": {
    "name": "Name of this Bridge",
    "pincode": "Pin code for the bridge MUST FOLLOW the format: 111-11-111",
    "mac": "Mac Address iex.: XX:XX:XX:XX:XX:XX",
    "port": "Bridge Port iex.: 45033"
  },
  "portainer": {
    "fqdn": "Portainer url including protocol iex.: https://portainer.local",
    "port": "Portainer Port 443",
    "username": "Username",
    "password": "Password",
    "cleanupInterval":"OPTIONAL, default 300secs: Integer for the bridge to remove deleted containers. iex.: 30",
    "emiterInterval":"OPTIONAL, default 60secs  :  for the bridge to check container status iex.: 60 ",
    "exclude": [
      {
        "name": "OPTIONAL, Used to filter which containers should be removed from the bridge. Remove the enttire exclude key to disable it"
      }
    ]
  }
}
```


# Build Image Locally 

Git clone: 
```
git clone https://github.com/ddmunhoz/portainerhkb
```

Enter the folder and run:

```docker build --tag portainerhkb:1.0 .```

Wait for docker to finish building your image.

###### Container launch CMD line

```
docker run -dt --name Portainer-HomeKitBridge \
-v /path_on_your_server/YOUR_CONTAINER_NAME/config-dockerBridge.json:/configs/config-dockerBridge.json \
-v /path_on_your_server/YOUR_CONTAINER_NAME/accessories:/persist \
--network host \
munhozdiego/portainerhkb:latest
```







