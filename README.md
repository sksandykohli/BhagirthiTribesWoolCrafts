# Bhagirthi Tribes Wool Crafts - E-commerce Website

Complete e-commerce website with authentication system and MongoDB database integration.

## Features

✅ Beautiful responsive design
✅ User authentication (Login/Signup)
✅ MongoDB database integration
✅ JWT token-based authentication
✅ Password hashing with bcrypt
✅ User profile management
✅ Shopping cart functionality
✅ Wishlist feature
✅ Mobile-responsive design
✅ Session management

## Technologies Used

### Frontend
- HTML5
- CSS3 (Custom styles with responsive design)
- JavaScript (Vanilla JS)
- Font Awesome 6.4.0 icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- Bcrypt for password hashing
- Express Session

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Step 1: Install MongoDB

**Option A: Local MongoDB**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string and update in `.env` file

### Step 2: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- express-session
- dotenv

### Step 3: Configure Environment Variables

Edit the `.env` file and update:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/bhagirthi-wool-crafts

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhagirthi-wool-crafts

# Change these to secure random strings
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server port
PORT=3000
```

### Step 4: Start the Server

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

You should see:
```
Server running on port 3000
MongoDB Connected Successfully
Visit: http://localhost:3000
```

### Step 5: Open the Website

Open your browser and navigate to:
- **Homepage:** http://localhost:3000/index.html
- **Login:** http://localhost:3000/login.html
- **Signup:** http://localhost:3000/signup.html

## File Structure

```
BhagirthiTribesWool Crafts/
│
├── index.html              # Homepage
├── login.html              # Login page
├── signup.html             # Signup page
├── styles.css              # All CSS styles
├── script.js               # Frontend JavaScript
│
├── server.js               # Express server & API routes
├── package.json            # Dependencies
├── .env                    # Environment variables
│
└── README.md              # This file
```

## API Endpoints

### Authentication Routes

**POST /api/signup**
- Create new user account
- Body: `{ fullName, email, phone, password, confirmPassword }`
- Returns: `{ success, message, token, user }`

**POST /api/login**
- Login with email and password
- Body: `{ email, password }`
- Returns: `{ success, message, token, user }`

**POST /api/logout**
- Logout current user
- Returns: `{ success, message }`

**GET /api/auth/check**
- Check if user is authenticated
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, authenticated, userId }`

### User Routes (Protected)

**GET /api/user/profile**
- Get user profile
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, user }`

**PUT /api/user/profile**
- Update user profile
- Headers: `Authorization: Bearer <token>`
- Body: `{ fullName, phone, address }`
- Returns: `{ success, message, user }`

### Password Reset Routes

**POST /api/forgot-password**
- Request password reset
- Body: `{ email }`
- Returns: `{ success, message, resetToken }`

**POST /api/reset-password**
- Reset password with token
- Body: `{ token, newPassword }`
- Returns: `{ success, message }`

## Database Schema

### User Collection

```javascript
{
  fullName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String (default: 'India')
  },
  wishlist: [ObjectId],
  cart: [{
    productId: String,
    quantity: Number,
    price: Number
  }],
  orders: [ObjectId],
  createdAt: Date,
  lastLogin: Date,
  isVerified: Boolean,
  role: String (enum: ['user', 'admin'])
}
```

## Features Explained

### 1. User Authentication
- Secure password hashing with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Token expiry: 7 days
- Session management for additional security

### 2. Form Validation
- Client-side validation (JavaScript)
- Server-side validation (Express)
- Email format validation
- Password strength requirements (minimum 6 characters)
- Phone number validation

### 3. Security Features
- Password hashing before storage
- JWT token verification
- CORS enabled for cross-origin requests
- Session secret for cookie security
- Environment variables for sensitive data

### 4. User Interface
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Password visibility toggle
- Password strength indicator
- Real-time form validation
- Alert messages for user feedback
- User dropdown menu in header

### 5. State Management
- localStorage for persistent login (Remember Me)
- sessionStorage for temporary session
- User data caching in localStorage
- Cart and wishlist count synchronization

## Usage

### Creating an Account
1. Click "Sign Up" in the header or navigate to signup.html
2. Fill in all required fields:
   - Full Name (minimum 3 characters)
   - Email (valid format)
   - Phone Number (10 digits)
   - Password (minimum 6 characters)
   - Confirm Password (must match)
3. Accept terms and conditions
4. Click "Create Account"
5. You'll be automatically logged in and redirected to homepage

### Logging In
1. Click "Login" in the header or navigate to login.html
2. Enter your email and password
3. Optionally check "Remember Me" for persistent login
4. Click "Login"
5. You'll be redirected to homepage with your session active

### Using the Website
- **Browse Products:** View products on homepage
- **Add to Cart:** Click "Add to Cart" (requires login)
- **Add to Wishlist:** Click heart icon (requires login)
- **View Profile:** Click user icon in header
- **Logout:** Click user icon → Logout

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```powershell
# Start MongoDB service
net start MongoDB
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in .env file or kill the process
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### CORS Errors
**Solution:** Make sure API_URL in script.js matches your server URL

### Token Expired
**Solution:** Login again. Tokens expire after 7 days.

## Development

### Running in Development Mode
```powershell
npm run dev
```
Uses nodemon for auto-restart on file changes.

### Environment Variables
Always use `.env` file for sensitive data. Never commit it to version control.

Add `.env` to `.gitignore`:
```
.env
node_modules/
```

## Production Deployment

### Before Deployment
1. Change JWT_SECRET and SESSION_SECRET to strong random strings
2. Use MongoDB Atlas for cloud database
3. Set NODE_ENV=production in .env
4. Enable HTTPS (set secure: true in session config)
5. Add rate limiting for API endpoints
6. Implement email verification
7. Add password reset email functionality

### Recommended Platforms
- **Heroku:** Easy deployment with MongoDB Atlas
- **Vercel:** Great for frontend with serverless functions
- **Railway:** Simple deployment for fullstack apps
- **AWS/Azure/GCP:** Full control and scalability

## Future Enhancements

- [ ] Product management (CRUD operations)
- [ ] Order management system
- [ ] Payment gateway integration
- [ ] Email verification
- [ ] Forgot password email
- [ ] Admin dashboard
- [ ] Product reviews and ratings
- [ ] Advanced search and filters
- [ ] Order tracking
- [ ] Invoice generation

## Support

For issues or questions:
1. Check this README first
2. Review the code comments
3. Check MongoDB connection
4. Verify all dependencies are installed
5. Check console for error messages

## License

This project is for educational purposes.

---

**Happy Coding! 🚀**
