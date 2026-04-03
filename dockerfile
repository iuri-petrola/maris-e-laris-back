#Imagem padrao ubuntu 24 do repositorio oficial
FROM ubuntu:24.04

# Adicionar Permissao no tmp
RUN chmod 777 /tmp

# instalação de pacotes basicos
RUN apt update && apt install -y vim links unzip telnet wget apt-utils net-tools

# Instalação do locale pt_BR
RUN apt update &&  apt install -y locales && rm -rf /var/lib/apt/lists/* && localedef -i pt_BR -c -f UTF-8 -A /usr/share/locale/locale.alias pt_BR.UTF-8
ENV LANG pt_BR.utf8


# Configurar Timezone America/Fortaleza
RUN apt update && apt install tzdata -y 
RUN	echo "America/Fortaleza" > /etc/timezone && rm -f  /etc/localtime && dpkg-reconfigure -f noninteractive tzdata


### Configurar Node ###
# Instala dependências e Node.js 18.20.8 via NodeSource
RUN apt update && apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs=18.20.8-1nodesource1

WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT npm run prd