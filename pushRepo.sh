#!/bin/sh

[ $# -eq 0 ] && echo "Please provide a commit message and try again" && exit 1;

(git add . && git commit -m "$1" && git push origin master) &