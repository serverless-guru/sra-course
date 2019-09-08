#! /bin/bash

# Example usage: npm run deploy dev us-west-2 => bash ./scripts/deploy.bash dev us-west-2

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

# Deploy to Serverless stack
sls deploy --region $region --stage $stage -v