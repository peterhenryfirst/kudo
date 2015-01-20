#!/bin/bash
#
# Debian-style distro installation of n and Node.js binaries.
#

##### INFO #####

# nodejs.sh
# --------------------------------------------------------------------------
# Install Node.js from binaries using n.
# See: https://github.com/visionmedia/n
# --------------------------------------------------------------------------

##### VARIABLES #####

# Throughout this script, some variables are used, these are defined first.
# These variables can be altered to fit your specific needs or preferences.

if [ -z "$1" ]; then
	N_VERSION=1.2.13
else
	N_VERSION="$1"
fi

if [ -z "$2" ]; then
	NODE_VERSION=stable
else
	NODE_VERSION="$2"
fi

#----- end of configurable variables -----#

##### PROVISION CHECK ######

# The provision check is intented to not run the full provision script when a box has already been provisioned.
# At the end of this script, a file is created on the vagrant box, we'll check if it exists now.
echo "[PROVISION NODEJS] Checking if the box was already provisioned..."

if [ -e "/home/vagrant/.provision_nodejs_check" ]
then
  # Skipping provisioning if the box is already provisioned
  echo "[PROVISION NODEJS] The box is already provisioned..."
  exit
fi

##### PROVISION NODEJS PACKAGES #####

echo "[PROVISION NODEJS] Installing n $N_VERSION and Node.js $NODE_VERSION"

cd /tmp
# Clean out any leftovers from an earlier provisioning run.
rm -rf n-${N_VERSION}
rm -f ${N_VERSION}.tar.gz

# Obtain n and install it.
wget https://github.com/tj/n/archive/v${N_VERSION}.zip
unzip v${N_VERSION}.zip
cd n-${N_VERSION}
make install

# n now obtains Node.js and installs it.
n $NODE_VERSION

cd /home/vagrant/

##### PROVISION CHECK #####

# Create .provision_check for the script to check on during a next vargant up.
echo "[PROVISION NODEJS] Creating .provision_nodejs_check file..."
touch .provision_nodejs_check