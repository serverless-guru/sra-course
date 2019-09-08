#! /bin/bash

# Example usage: npm run remove dev us-west-2 => bash ./scripts/remove.bash dev us-west-2

# Variables
service_name="sra-backend"
stage=$1
region=$2
profile="serverless-tutorial"

# Default stage if not passed
if [[ -z $stage ]];
then
    stage="dev"
fi

# Default region if not passed
if [[ -z $region ]];
then
    region="us-west-2"
fi

# Extra debug logs
export SLS_DEBUG="*"

# Remove Serverless Stack
sls remove --region $region --stage $stage -v