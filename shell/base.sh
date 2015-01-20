#! /bin/bash
#
# Debian-style distro installation of apache2 & php.
#

##### INFO #####

# base.sh
# --------------------------------------------------------------------------
# Install different elements needed to develope.
# --------------------------------------------------------------------------

##### VARIABLES #####

# Throughout this script, some variables are used, these are defined first.
# These variables can be altered to fit your specific needs or preferences.

#----- end of configurable variables -----#

##### PROVISION CHECK ######

# The provision check is intented to not run the full provision script when a box has already been provisioned.
# At the end of this script, a file is created on the vagrant box, we'll check if it exists now.
echo -e "\e[34m[PROVISION BASE]\e[0m Checking if the box was already provisioned..."

if [ -e "/home/vagrant/.provision_base_check" ]
then
  # Skipping provisioning if the box is already provisioned
  echo -e "\e[34m[PROVISION BASE]\e[0m The box is already provisioned..."
  exit
fi

##### PROVISION BASE PACKAGES #####

echo -e "\e[34m[PROVISION BASE]\e[0m Installing Base Packages..."

# Update
#sudo apt-get -y update

sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg:Options::="--force-confnew --force-confdef" -y update

# Install base packages
#sudo apt-get install -y unzip git-core ack-grep vim tmux curl wget build-essential python-software-properties
#sudo apt-get install -y curl wget make openssl unzip vim tree build-essential
sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg:Options::="--force-confnew --force-confdef" install -y --force-yes -fuy -f -q curl wget make openssl unzip vim tree build-essential

#sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg::Options::="--force-confdef" -o Dpkg:Options::="--force-confnew" -o Dpkg::Options::="--force-confold" install -y --force-yes -fuy -f -q libssl-dev
sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg:Options::="--force-confnew --force-confdef" install -y --force-yes -fuy -f -q libssl-dev

##### PROVISION CHECK #####

# Create .provision_check for the script to check on during a next vargant up.
echo -e "\e[34m[PROVISION BASE]\e[0m Creating .provision_base_check file..."
touch .provision_base_check