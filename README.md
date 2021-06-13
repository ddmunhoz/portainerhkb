# Docker  HomeKit Bridge


##  Docker - HOWTO :D

###### Build Image 


Enter the folder and run ```docker build --tag dockerhkb:1.0 .```
Wait for docker to finish building your image.

###### Container launch CMD line

```
docker run -dt --name YOUR_CONTAINER_NAME \
-v /path_on_your_server/YOUR_CONTAINER_NAME/config-SynoNasBridge.json:/tmp/SynoNasHKB/configs/config-SynoRouterBridge.json \
-v /path_on_your_server/YOUR_CONTAINER_NAME/accessories:/persist \
--network host \
synorouterhkb:1.0
```







