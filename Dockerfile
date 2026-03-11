FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Add environment variables required for build
ENV NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummykey123

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]
