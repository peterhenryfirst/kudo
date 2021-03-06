# -*- mode: ruby -*-
# vi: set ft=ruby :

# N & Node Options
n_version	        = "1.2.13"
nodejs_version    = "stable"

Vagrant.configure(2) do |config|
  
  config.vm.box = "ubuntu/trusty64"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"
  
  # Required for NFS to work, pick any local IP
  config.vm.network :private_network, ip: '192.168.50.60'
  #Use NFS for shared folders for better performance
  config.vm.synced_folder '.', '/vagrant', nfs: true
  config.vm.synced_folder "src/", "/var/src", nfs: true
  
  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    vb.gui = true
    # Customize the amount of memory on the VM:
    # vb.memory = "1024"
	
    vb.customize ["modifyvm", :id, "--memory", "1024"]
	vb.customize ["modifyvm", :id, "--cpus", "2"]
	vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
	
  end
  
  #############################################################################################
  #################################### SHELL SCRIPTS (BASH) ###################################
  #############################################################################################
  
  ####
  # Base Items
  ##########

  # Provision Base Packages
  config.vm.provision "shell", path: "shell/base.sh"
  
  ####
  # N & NodeJS
  ##########

  # Provision NodeJS Packages
  config.vm.provision "shell", path: "shell/nodejs.sh", args: [n_version, nodejs_version]
  
  ####
  # Docker
  ##########

  # Provision Docker Packages
  config.vm.provision "shell", path: "shell/docker.sh"
  
end
