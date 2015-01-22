#! /bin/bash

docker run -d --name="redis-db" -p 6379:6379 dockerfile/redis