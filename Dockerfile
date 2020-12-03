# see versions at https://hub.docker.com/_/ghost
FROM ghost:3.38

WORKDIR $GHOST_INSTALL
COPY . .

RUN chmod +x start.sh && ./start.sh

ENTRYPOINT []
CMD ["./start.sh"]
