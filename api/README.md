# Hostel Finder API

This is the backend API for the Hostel Finder application, serving both the client and admin frontends.

## Environment Variables

The following environment variables are required:

- `MONGO`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Port number for the server (default: 8800)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: hostel-finder-api
   - **Environment**: Node
   - **Build Command**: `yarn install`
   - **Start Command**: `node index.js`
   - **Plan**: Free or paid depending on your needs

4. Add the following environment variables in Render:
   - `MONGO`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: production
   - `ALLOWED_ORIGINS`: https://hostel-finder-client.onrender.com,https://hostel-finder-admin.onrender.com

5. Deploy the service

## API Endpoints

- `/api/auth`: Authentication endpoints
- `/api/users`: User management endpoints
- `/api/hostel`: Hostel management endpoints
- `/api/rooms`: Room management endpoints
- `/api/restaurants`: Restaurant management endpoints
- `/api/beds`: Bed management endpoints
- `/api/bookings`: Booking management endpoints
- `/api/reviews`: Review management endpoints 