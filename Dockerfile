FROM node:17-slim
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN apt update && apt install python3 build-essential nano -y
RUN cp /usr/bin/python3 /usr/bin/python
# COPY ["package.json", "yarn.lock", "./bin", "./packages", "./.yarn", "./"]

# Find some way to copy the ./packages dir, including the dir itself.
COPY . .
RUN yarn install
RUN yarn workspaces foreach install
COPY ./ .
EXPOSE 80
EXPOSE 443
RUN chown -R node /usr/src/app
USER node
CMD ["yarn", "start"]
