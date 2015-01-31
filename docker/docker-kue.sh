#! /bin/bash

#docker build -t peter/kudo:0.1 .

docker run -i -t --rm                     \
      -p 3000:3000                        \
      -v `pwd`:/var/src                   \
      --name="app-kue-p"                  \
      --link redis-db:redis-db            \
      -e REDIS_HOST="redis-db"            \
      peter/kudo:0.1

docker run -i -t --rm                     \
      -v `pwd`:/var/src                   \
      --name="app-kue-c-01"               \
      --link redis-db:redis-db            \
      -e REDIS_HOST="redis-db"            \
      peter/kudo:0.1

docker run -i -t --rm                     \
      -p 3000:3000                        \
      --name="app-kue-p"                  \
      --link redis-db:redis-db            \
      -e REDIS_HOST="redis-db"            \
      peter/kudo:0.1
