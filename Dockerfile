
FROM dockerfile/ubuntu

MAINTAINER Pedro Pereira <pereira.pedro.h@gmail.com>

# Update apt-get
#RUN \
#apt-get -y -qq update && \
#apt-get -y -qq upgrade 

# Install Redis VERSION 0.0
#RUN \
#  apt-get -y -qq install python redis-server

# Install Node
RUN \
  cd /opt && \
  wget https://github.com/tj/n/archive/v1.2.13.zip && \
  unzip v1.2.13.zip && \
  mv n-1.2.13 n && \
  cd n && \
  make install && \
  n stable && \
  rm -f /opt/v1.2.13.zip

# Set the working directory VERSION 0.1
#WORKDIR /var/src

#CMD ["/bin/bash"]

# Bundle app source
COPY . /src
# Install app dependencies
RUN cd /src; npm install

EXPOSE  3000
CMD ["node", "/src/app.js"]