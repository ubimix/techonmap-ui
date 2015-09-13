#!/bin/bash

cd `dirname $0`/../
dir=`pwd`

run_in_docker(){
    sudo docker run --name "techonmap-docker" -it -v "$dir":/data --rm dockerfile/nodejs $1  
}

docker pull dockerfile/nodejs
run_in_docker "npm install"
run_in_docker "npm install grunt-cli"
run_in_docker "node_modules/grunt-cli/bin/grunt"
