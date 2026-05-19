FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy your actual backend source code
COPY . .

# Expose port 3000 internally inside the container environment
EXPOSE 3000

# Start your application
# (Make sure index.js matches your actual server entry point file)
CMD ["node", "index.js"]
