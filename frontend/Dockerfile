FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci # install
RUN npm install express http-proxy-middleware

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AI_SEARCH_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_AI_SEARCH_URL=$VITE_AI_SEARCH_URL

RUN npm run build

CMD ["node", "server.cjs"]
