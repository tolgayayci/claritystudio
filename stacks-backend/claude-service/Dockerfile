FROM node:20-slim

# Install git (required by Claude Code) and other deps
RUN apt-get update && apt-get install -y git procps && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app
COPY package.json .
RUN npm install

COPY server.js .

EXPOSE 3002

CMD ["node", "server.js"]
