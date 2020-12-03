# see versions at https://hub.docker.com/_/ghost
FROM ghost:3.39

WORKDIR $GHOST_INSTALL
COPY . .

ENTRYPOINT []
CMD ["node current/index.js"]
