FROM node:20
WORKDIR /app

# ensure local node_modules/.bin is in PATH so tools like vite are found when running npm scripts
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
