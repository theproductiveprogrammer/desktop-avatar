FROM buildkite/puppeteer:latest

RUN npm install -g npm@latest

# set up vim for easy container editing
RUN apt-get update \
      && apt-get install -y vim \
      && rm -rf /var/lib/apt/lists/*
COPY .vimrc /root/.vimrc

WORKDIR /desktop-avatar
COPY package.json package-lock.json .
COPY src src
RUN npm install
CMD ["/usr/local/bin/node", "."]
