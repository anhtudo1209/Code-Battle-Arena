// I. INSTALL NECESSARY COMPONENTS
0. Install (or run) redis:
- open cmd: docker run -d --name redis -p 6379:6379 redis (first time)
- docker start redis (second time)
1. In the root folder: npm install
2. cd frontend: npm install + npm run build (build each time when making changes to frontend)

// II. RUN THE SERVER
0. change the origin in the app.js to http://localhost:3000 (for testing)
1. In the root folder: npm run start (start the backend + frontend)
2. cd backend/src: node worker.js (jugde system)
3. cd backend/src: node matchworker.js (match system)

// flush redis: docker exec -it redis redis-cli FLUSHDB
