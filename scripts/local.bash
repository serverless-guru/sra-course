#! /bin/bash

# Inject environment variables
export TABLE_NAME="sra-backend-users-table-dev"
export S3_BUCKET="sra-backend-profile-images-dev"
export REGION="us-west-2"

node local.js