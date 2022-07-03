aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 672159049751.dkr.ecr.us-west-1.amazonaws.com
docker build -t email-sender .
docker tag email-sender:latest 672159049751.dkr.ecr.us-west-1.amazonaws.com/email-sender:latest
docker push 672159049751.dkr.ecr.us-west-1.amazonaws.com/email-sender:latest