# Sử dụng Node.js phiên bản ổn định
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose port để kết nối
EXPOSE 3000

# Command để chạy ứng dụng
CMD ["node", "index.js"]
