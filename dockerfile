
FROM  node:16.3.0-stretch
WORKDIR /app
COPY src/. .
ADD package.json .
RUN npm install

# Entry point
CMD ["bash", "-c", "node dockerBridge"]
