FROM node:16-slim

# Install necessary dependencies for Playwright
RUN apt-get update && apt-get install -y \
  libnss3 \
  libnspr4 \
  libgbm1 \
  && rm -rf /var/lib/apt/lists/*

# Install playwright and dependencies
WORKDIR /app
COPY . .
RUN npm install
RUN npx playwright install

CMD ["npm", "start"]
