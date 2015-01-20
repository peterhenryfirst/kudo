#! /bin/bash
#
# Debian-style distro installation of apache2 & php.
#

##### INFO #####

# docker.sh
# --------------------------------------------------------------------------
# Install the last docker from repository.
# --------------------------------------------------------------------------

##### VARIABLES #####

# Throughout this script, some variables are used, these are defined first.
# These variables can be altered to fit your specific needs or preferences.

#----- end of configurable variables -----#

##### PROVISION CHECK ######

# The provision check is intented to not run the full provision script when a box has already been provisioned.
# At the end of this script, a file is created on the vagrant box, we'll check if it exists now.
echo -e "\e[34m[PROVISION DOCKER]\e[0m Checking if the box was already provisioned..."

if [ -e "/home/vagrant/.provision_docker_check" ]
then
  # Skipping provisioning if the box is already provisioned
  echo -e "\e[34m[PROVISION DOCKER]\e[0m The box is already provisioned..."
  exit
fi

##### PROVISION DOCKER PACKAGES #####

echo -e "\e[34m[PROVISION DOCKER]\e[0m Installing Docker Packages..."

# Check that HTTPS transport is available to APT
if [ ! -e /usr/lib/apt/methods/https ]; then
	sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg:Options::="--force-confnew --force-confdef" -y update
	sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg:Options::="--force-confnew --force-confdef" install -y --force-yes -fuy -f -q apt-transport-https
fi

# Add the repository to your APT sources
echo deb https://get.docker.com/ubuntu docker main > /etc/apt/sources.list.d/docker.list

# Then import the repository key
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 36A1D7869245C8950F966E92D8576A8BA88D21E9

# Install docker
sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg:Options::="--force-confnew --force-confdef" -y update
sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg:Options::="--force-confnew --force-confdef" -y install lxc-docker

#
# Alternatively, just use the curl-able install.sh script provided at https://get.docker.com
#


##### PROVISION CHECK #####

# Create .provision_check for the script to check on during a next vargant up.
echo -e "\e[34m[PROVISION DOCKER]\e[0m Creating .provision_docker_check file..."
touch .provision_docker_check