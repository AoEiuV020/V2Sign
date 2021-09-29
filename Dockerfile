FROM node:10-alpine
LABEL maintainer="AoEiuV020 <aoeiuv020@gmail.com>"
COPY package.json package-lock.json /opt/V2Sign/
WORKDIR /opt/V2Sign
RUN npm install
ADD ./ /opt/V2Sign/
EXPOSE 3000
USER node:node
ENTRYPOINT ["npm", "start"]
