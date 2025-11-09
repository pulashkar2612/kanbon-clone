# Kanban Application

## Overview

A feature-rich Kanban application built with **React** and **TypeScript**, designed to streamline task management with options for Board View and List View. It integrates Firebase for backend services and supports custom styling via Tailwind CSS.

---

## Features

- **Task Management**: Create, edit, and manage tasks.
- **Dynamic Views**: Switch between Board View and List View for flexibility.
- **Filter and Search**: Intuitive task filtering and search functionality.
- **Authentication**: Secure user authentication via Firebase.
- **Theme Support**: Light and dark themes with user preferences stored.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **AWS SDK Integration**: Placeholder for advanced integrations (e.g., S3 storage).

---

## Project Structure

```plaintext
kanban-main
├── public                  # Static assets
│   └── vite.svg
├── src                     # Application source code
│   ├── assets              # Images and icons
│   ├── aws                 # AWS SDK utilities
│   ├── components          # React components
│   │   ├── BoardView       # Board view-specific components
│   │   ├── ListView        # List view-specific components
│   │   ├── ui              # Reusable UI elements (Button, Input, Dropdown)
│   │   └── ...
│   ├── firebase            # Firebase configuration and utilities
│   ├── hooks               # Custom React hooks for state management
│   ├── layouts             # Layout components
│   ├── pages               # Page-level components (Home, Login)
│   ├── routes              # Application routes
│   ├── styles              # Tailwind and custom CSS
│   ├── types               # TypeScript type definitions
│   └── utility             # Helper functions
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation
```

---

## Installation

### Prerequisites

- **Node.js** (>= 16.x)
- **Yarn** (preferred over npm for this project)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/pulashkar2612/kanbon-clone.git
   cd kanban
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

- for ease, env file with firebase credentials has been sent as well.

- Copy the provided `env.txt` file to `.env`.
- Populate the required Firebase and AWS keys.

4. Start the development server:

   ```bash
   yarn dev
   ```

5. Open the application in your browser:
   ```
   http://localhost:5173
   ```

---

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `yarn dev`     | Start the development server         |
| `yarn build`   | Build the application for production |
| `yarn lint`    | Lint the project code                |
| `yarn preview` | Preview the production build         |

---

## Technologies Used

- **Frontend**:

  - React
  - TypeScript
  - Tailwind CSS

- **Backend Services**:

  - Firebase Authentication
  - Firebase Firestore
  - AWS SDK (for image upload)

- **Tooling**:
  - Vite (Build tool)
  - PostCSS

---

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For any inquiries or issues, feel free to contact the project maintainer:

- **Name**: Prashant pulashkar
- **GitHub**: [pulashkar2612](https://github.com/pulashkar2612)
- **Email**: [pulashkar2612@gmail.com](mailto:pulashkar2612@gmail.com)
