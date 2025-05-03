FROM node:18

# Робоча директорія
WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm install --legacy-peer-deps

# Копіюємо решту коду
COPY . .

# Запускаємо dev-сервер
CMD ["npm", "start"]
