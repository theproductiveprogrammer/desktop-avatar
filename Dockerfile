FROM buildkite/puppeteer:latest

RUN npm install -g npm@latest

RUN apt-get update \
      && apt-get install -y vim \
      && rm -rf /var/lib/apt/lists/*

WORKDIR /desktop-avatar
COPY . .
RUN npm install
CMD ["/bin/bash"]
