import path from "./utils/path";
import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  HomePage,
  SubmitMusic,
  Profile,
  LicenseMusic,
  AboutUs,
} from "./pages/Client";
import { ClientLayout, AdminLayout, NotFound } from "./components";
import { ForgotPassword, Login, Register, ChangePassWord } from "./pages/Auth";
import { AuthProvider } from "./context/authContext.jsx";
import "../../YeuRecordsFrontend/src/styles/custom.css";
import ProtectedRoute from "./hocs/ProtectedRoute.jsx";
import {
  ManageArtists,
  ManageCategories,
  ManageMusic,
  ManageLicenses,
  DashBoash,
  DigitalSignature,
} from "./pages/Admin/index";

const router = createBrowserRouter([
  {
    path: path.HOME,
    element: <ClientLayout />,
    errorElement: <NotFound />,
    children: [
      { path: path.HOME, element: <HomePage /> },
      { path: path.ABOUT_US, element: <AboutUs /> },
    ],
  },
  {
    path: path.ADMIN,
    element: (
      <ProtectedRoute roles={["ADMIN", "STAFF"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <DashBoash /> },
      { path: path.MANAGE_ARTISTS, element: <ManageArtists /> },
      { path: path.MANAGE_MUSIC, element: <ManageMusic /> },
      { path: path.MANAGE_LICENSES, element: <ManageLicenses /> },
      { path: path.MANAGE_CATEGORIES, element: <ManageCategories /> },
      { path: path.MANAGE_SIGNATURE, element: <DigitalSignature /> },
    ],
  },
  {
    path: path.SUBMIT_MUSIC,
    element: <SubmitMusic />,
  },
  { path: path.REGISTER, element: <Register /> },
  { path: path.LOGIN, element: <Login /> },
  { path: path.FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: path.CHANGE_PASSWORD, element: <ChangePassWord /> },
  { path: path.LISENCE_MUSIC, element: <LicenseMusic /> },

  {
    path: path.PROFILE,
    element: (
      <ProtectedRoute roles={["USER", "ADMIN", "STAFF"]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <div className="font-ubuntu">
        <RouterProvider router={router} />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
