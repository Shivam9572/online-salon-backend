Online Salon Backend

Backend API for an Online Salon Appointment Booking System. This project manages customers, salon providers, admins, services, categories, staff, appointments, payments, feedback, OTP/authentication, image upload, and real-time socket support.


---

Tech Stack

Node.js

Express.js

MySQL

Sequelize ORM

Sequelize CLI

JWT Authentication

Cookie Parser

CORS

Multer

Cloudinary

Razorpay

Nodemailer

Socket.IO

Node Cron



---

Features

Customer registration and login

Provider registration and login

Admin registration and login

Forgot password and reset password

Admin provider approval system

Provider profile management

Provider service and category management

Staff management

Chair update support

Customer profile management

Search salons/providers

Nearby provider listing

Top provider listing

Appointment booking

Available slot checking

Appointment cancellation

Provider appointment status update

Razorpay payment verification

Feedback and rating system

Cloudinary profile image upload

MySQL migrations and seeders

Cron job for appointment cleanup

Socket.IO setup



---

Project Structure

online-salon-backend/
│
├── config/              # Database config
├── controllers/         # Route controllers
├── crons/               # Cron jobs
├── middleware/          # Auth and upload middleware
├── migrations/          # Sequelize migrations
├── models/              # Sequelize models
├── routers/             # API routes
├── seeders/             # Sequelize seeders
├── services/            # Service/helper files
├── socket/              # Socket.IO connection
├── app.js               # Main server file
├── package.json
└── README.md


---

Installation

git clone https://github.com/Shivam9572/online-salon-backend.git
cd online-salon-backend
npm install


---

Environment Variables

Create a .env file in the root folder:

PORT=5000

MYSQLHOST=localhost
MYSQLUSER=root
MYSQLPASSWORD=your_mysql_password
MYSQLDATABASE=salon_management
MYSQLPORT=3306

JWT_SECRET=your_jwt_secret

FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_USER=http://localhost:3002

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

> Change variable names according to your exact controller/service usage if needed.




---

Run Locally

npm run dev

Server will run on:

http://localhost:5000

API welcome route:

GET /api


---

Production Start

npm start


---

Database Migration

Run all migrations:

npm run migrate

Undo last migration:

npm run migrate:undo

Undo all migrations:

npm run migrate:undo:all


---

Database Seeder

Run seeders:

npm run seed

Undo seeders:

npm run seed:undo


---

API Routes

Auth Routes

Customer Auth

POST /api/auth/customer/register
POST /api/auth/customer/login
POST /api/auth/customer/forgot-password/:userType
POST /api/auth/customer/reset-password/:userType

Provider Auth

POST /api/auth/provider/register
POST /api/auth/provider/login
POST /api/auth/provider/forgot-password/:userType
POST /api/auth/provider/reset-password/:userType

Admin Auth

POST /api/auth/admin/register
POST /api/auth/admin/login
POST /api/auth/admin/forgot-password/:userType
POST /api/auth/admin/reset-password/:userType


---

Verify Auth

GET /api/verifyAuth


---

Admin Routes

PUT  /api/admin/approve/:email
GET  /api/admin/category
POST /api/admin/provider/:status
POST /api/admin/users


---

Customer Routes

GET /api/customer/providers/nearby
GET /api/customer/providers/top
GET /api/customer/providers/search
GET /api/customer/providers/:providerId/services
GET /api/customer/profile
PUT /api/customer/profile


---

Provider Routes

GET    /api/provider/profile
PUT    /api/provider/profile
PUT    /api/provider/profile/upload
GET    /api/provider/categories
POST   /api/provider/categories/:categoryId
POST   /api/provider/services
GET    /api/provider/services
DELETE /api/provider/services/:id
PUT    /api/provider/chair
GET    /api/provider/:providerId


---

Staff Routes

POST   /api/staff
GET    /api/staff
PUT    /api/staff/:staffId
DELETE /api/staff/:staffId


---

Category Routes

GET    /api/category
POST   /api/category
GET    /api/category/services/:categoryId
DELETE /api/category/remove/:categoryId


---

Service Routes

GET    /api/service
POST   /api/service
GET    /api/service/:id
PUT    /api/service/:id
DELETE /api/service/:id


---

Appointment Routes

POST   /api/appointment
GET    /api/appointment
GET    /api/appointment/provider
GET    /api/appointment/:appointmentId
DELETE /api/appointment/:appointmentId/cancel
PATCH  /api/appointment/:appointmentId/status-set
POST   /api/appointment/slots


---

Payment Routes

POST /api/payment/verify


---

Feedback Routes

POST /api/feedback/:appointment_id


---

Deployment Notes

Railway Deployment

1. Add MySQL database service.


2. Add all required environment variables.


3. Set start command:



npm start

4. Run migration command after deployment:



npm run migrate

5. Run seeders if required:



npm run seed


---

Important Notes

Make sure MySQL server is running before starting the backend.

Configure Cloudinary credentials properly for image uploads.

Configure Razorpay keys for payment support.

Use strong JWT secrets in production.

Enable CORS for frontend domains.



---

Future Improvements

Real-time notifications

Google OAuth login

SMS OTP verification

Booking reminder notifications

Analytics dashboard

Advanced salon search filters

Multi-vendor support



---

Author

Shivam Kumar

GitHub: https://github.com/Shivam9572


---

License

This project is licensed for educational and portfolio purposes.
