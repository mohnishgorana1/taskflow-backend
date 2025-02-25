# taskflow-backend
 
taskflow-backend/
│── user-service/          # Handles authentication, user roles  PORT: 5001 | Uses JWT-based authentication
│   ├── src/  
│   │   ├── routes/   
│   │   ├── middlewares/  
│   │   ├── controllers/  
│   │   ├── models/  
│   │   ├── services/  
│   │   ├── server.ts  # Starts Express server  
│   ├── package.json  
│── task-service/          # Handles task creation, assignment, updates  PORT: 5002 | Communicates user-service user verification
│   ├── src/  
│   │   ├── routes/  
│   │   ├── models/  
│   │   ├── middlewares/  
│   │   ├── controllers/  
│   │   ├── middlewares/  
│   │   ├── utils/
│   │   ├── events/        (for notification)  
│   │   ├── server.ts  
│   ├── package.json  
│── notification-service/  # Handles email & real-time notifications  PORT: 5003 |  Uses Redis Pub/Sub for real-time messaging | Sends email & WebSocket notifications
│   ├── src/  
│   │   ├── events/  
│   │   ├── server.ts  
│   ├── package.json  
│── gateway-api/           # API Gateway (optional)   PORT: 5000 |  #Acts as a reverse proxy for all services | #Handles authentication & rate limiting
│   ├── src/  
│   │   ├── routes/  
│   │   ├── server.ts  
│   ├── package.json  
│── shared/                # Reusable utilities (e.g., logging, DB connections, authMiddleware)  
│── docker-compose.yml     # Defines multi-container setup  
│── .env                   # Common environment variables  
│── package.json           # (Optional) Root package.json for monorepo  
