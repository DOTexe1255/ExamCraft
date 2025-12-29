# ExamCraft Backend API Documentation

**Updated: Dec 29, 2025**  
**Authentication: HttpOnly JWT Cookies + Device Fingerprint**  
**Database: MySQL** | **Roles: institute, department, student**

---

## 🗝️ Authentication Flow


POST /api/auth/login → Sets HttpOnly cookie (30min expiry)

Browser AUTO-sends cookie on all requests

NO Authorization header needed

Fingerprint prevents token theft



---

## 1. Authentication Endpoints

### 1.1 Institute Admin Registration

POST /api/auth/institute-admin-register

**Purpose**: Create institute admin for existing institute  
**Headers**: `None`  
**Sample Request**:


{
"first_name": "Super",
"last_name": "Admin",
"email": "admin@techinst.com",
"password": "password123",
"institute_id": 1,
"phone": "9876543210"
}

**Response**: `201 { "message": "Institute admin created successfully", "user_id": 1 }`

### 1.2 Department Admin Registration

POST /api/auth/department-admin-register

**Purpose**: Create department admin  
**Headers**: `None`  
**Sample Request**:

{
"first_name": "CS",
"last_name": "Head",
"email": "cshead@techinst.com",
"password": "password123",
"institute_id": 1,
"department_id": 1,
"phone": "9876543212"
}



### 1.3 Student Registration

POST /api/auth/student-register

**Purpose**: Register student under institute+department  
**Headers**: `None`  
**Sample Request**:

{
"first_name": "John",
"last_name": "Doe",
"email": "john.doe@techinst.com",
"password": "password123",
"institute_id": 1,
"department_id": 1,
"phone": "9876543214"
}


### 1.4 Unified Login ⭐ **UPDATED**

POST /api/auth/login

**Purpose**: Login any role → **Sets HttpOnly JWT cookie**  
**Headers**: `None` (cookie auto-set)  
**Sample Request**:

{
"email": "admin@techinst.com",
"password": "password123",
"role": "institute"
}

**Response**:
{
"message": "Login successful",
"user": {
"id": 1,
"email": "admin@techinst.com",
"role": "institute",
"institute_id": 1,
"department_id": null,
"first_name": "Super",
"last_name": "Admin"
}
}


**Cookie**: `token=eyJhbGciOiJIUzI1Ni...` (HttpOnly, 30min)

### 1.5 Verify Auth ⭐ **NEW**
 
GET /api/auth/verify

**Purpose**: React `useAuth` hook → Check login status  
**Headers**: `None` (uses cookie)  
**Response (Success)**:

{
"authenticated": true,
"user": {
"id": 1,
"role": "institute",
"institute_id": 1,
"department_id": null
}
}



---

## 2. Institute Management

### 2.1 Create Institute

POST /api/institute

**Sample Request**:

{
"name": "Tech Institute Pune",
"code": "TI001",
"address": "Pune, Maharashtra",
"contact_email": "admin@techinst.com",
"phone": "9876543210"
}


---

## 3. Department Management

### 3.1 Create Department

POST /api/department

**Sample Request**:

{
"institute_id": 1,
"name": "Computer Science",
"code": "CS",
"head_email": "cshead@techinst.com"
}

---

## 4. Protected User Endpoints ⭐ **UPDATED**

### 4.1 Get User Data

GET /api/user/getuserdata

**Purpose**: Get authenticated user profile  
**Headers**: `None` *(Cookie auto-sent)*  
**Response**:

{
"user": {
"user_id": 1,
"email": "john.doe@techinst.com",
"role": "student",
"first_name": "John",
"last_name": "Doe",
"institute_id": 1,
"department_id": 1,
"is_active": true
}
}


---

## 🎯 Frontend Integration (React) ⭐ **COMPLETE ASYNC/AWAIT**

// 1. LOGIN - credentials: 'include' CRITICAL!

const loginUser = async (email, password, role) => {
try {
const response = await fetch('/api/auth/login', {
method: 'POST',
credentials: 'include', // ✅ CRITICAL: Sends/receives cookies
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({ email, password, role })
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || 'Login failed');
}

return data.user; // { id, role, institute_id, ... }
} catch (error) {
console.error('Login error:', error);
throw error;
}
};

// 2. VERIFY AUTH STATUS
const verifyAuth = async () => {
try {
const response = await fetch('/api/auth/verify', {
credentials: 'include' // ✅ CRITICAL: Sends cookie
});
const data = await response.json();
return data; // { authenticated: true/false, user: {...} }
} catch (error) {
console.error('Auth check failed:', error);
return { authenticated: false, user: null };
}
};

// 3. GET PROTECTED USER DATA
const getUserData = async () => {
try {
const response = await fetch('/api/user/getuserdata', {
credentials: 'include' // ✅ CRITICAL: Sends cookie
});
const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || 'Failed to fetch user data');
}

return data.user;
} catch (error) {
console.error('User data error:', error);
throw error;
}
};


---

