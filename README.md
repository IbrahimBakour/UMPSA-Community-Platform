# 🏫 UMPSA Community Platform

The **UMPSA Community Platform** is a **MERN-based web application** developed as my **Final Year Project (FYP)**.  
It serves as an interactive community hub connecting **students, clubs, and administrators**, enabling engagement, content sharing, and effective communication within the UMPSA community.

---

## 🚀 Features
- 🧍‍♀️ **User Roles:** Separate functionalities for students, club representatives, and administrators.  
- 📰 **Post Management:** Users can create, edit, like, and comment on community posts.  
- 🎓 **Club Management:** Clubs can manage members, announcements, and events.  
- ⚠️ **Reporting System:** Allows users to report posts or users for moderator review.  
- 📱 **Responsive UI:** Built with React.js and Bootstrap for seamless multi-device usability.  
- 🔐 **Authentication:** Secure login and registration using JWT (JSON Web Token).  

---

## 🧰 Technologies Used
- **Frontend:** React.js, Bootstrap, Axios  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ORM)  
- **Authentication:** JWT (JSON Web Tokens)  
- **Server Environment:** Node.js runtime  
- **Hosting (optional):** Render / Vercel / MongoDB Atlas  

---

## ⚙️ Installation & Setup
```bash
# Clone the repository
git clone https://github.com/IbrahimBakour/UMPSA-Community-Platform.git

# Backend setup
cd backend
npm install
# configure environment variables
cp .env.example .env

# Frontend setup
cd frontend
npm install

# Run both frontend and backend
npm run dev
