# UMPSA Community Platform

## Overview
The UMPSA Community Platform is a web application built using the MERN stack (MongoDB, Express, React, Node.js) that serves as a community hub for users to interact, create clubs, and share posts. This platform supports user authentication, club management, and various social interactions such as comments and reactions.

## Features
- User authentication with JWT
- Role-based access control (student, clubMember, admin)
- Club creation and management
- Feed posts with approval workflow
- Comments and reactions on posts
- Media uploads support
- Excel import for user management

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB
- Cloudinary (for media uploads)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd umpsa-community-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.

### Running the Application
1. Start the MongoDB server.
2. Run the application:
   ```
   npm start
   ```

3. The application will be available at `http://localhost:PORT`, where `PORT` is defined in your `.env` file.

### API Documentation
Refer to the API documentation for details on available endpoints, request/response formats, and authentication requirements.

### Testing
To run tests, use:
```
npm test
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.