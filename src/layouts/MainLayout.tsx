// src/layouts/MainLayout.tsx
import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
// import Drawer from '../components/Drawer';
import Header from '../components/Header';

// Define the type for the children prop
interface MainLayoutProps {
  children: ReactNode;
}
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Prashant Pulashkar" />
        <meta name="keywords" content="task management, react app, productivity, todo list" />
        <meta name="description" content="A task management app to keep you organized." />
        <title>Kanban</title>
      </Helmet>
      <Header />
      {/* <Drawer /> */}
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
