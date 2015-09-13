#!/bin/bash

cd `dirname $0`/../
dir=`pwd`
port=$1
if [ "$port" == "" ]; then
    port=9888
fi;

run_in_docker(){
    sudo docker run --name "techonmap-docker" -it $2 -v "$dir":/data --rm dockerfile/nodejs $1  
}

run_in_docker "npm start" "-p $port:9888"
