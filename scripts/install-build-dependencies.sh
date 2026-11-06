#!/usr/bin/env bash

sudo apt-get install -y unzip zip

wget https://releases.hashicorp.com/terraform/1.1.2/terraform_1.1.2_linux_amd64.zip
unzip terraform_1.1.2_linux_amd64.zip
sudo mv terraform /usr/local/bin/

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

S5CMD_VERSION=2.3.0
curl -L "https://github.com/peak/s5cmd/releases/download/v${S5CMD_VERSION}/s5cmd_${S5CMD_VERSION}_Linux-64bit.tar.gz" -o s5cmd.tar.gz
echo "de0fdbfa3aceae55e069ba81a0fc17b2026567637603734a387b2fca06c299b4  s5cmd.tar.gz" | sha256sum -c -
tar -xzf s5cmd.tar.gz s5cmd
sudo mv s5cmd /usr/local/bin/
