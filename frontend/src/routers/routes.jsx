import { createBrowserRouter } from "react-router-dom";

// components
import App from "../App.jsx";
import Register from "../pages/Register.jsx";
import Login from "../pages/Login.jsx";
import TestProgress from "../pages/TestProgress.jsx";
import Conversation from "../pages/Conversation.jsx"

// actions
import { logoutAction } from "../actions/logoutActions.js";

// loaders
import { protectedLoader, publicLoader } from "../utils/protectedRoute.js";

// router
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        loader: protectedLoader, // Bảo vệ trang chủ
        children:[
            {
                path: '/conversation/:conversationId',
                element: <Conversation/>
            }
        ]

    },
    {
        path: "/register",
        element: <Register />,
        loader: publicLoader, // Redirect nếu đã login
    },
    {
        path: "/login",
        element: <Login />,
        loader: publicLoader, // Redirect nếu đã login
    },
    {
        path: "/logout",
        action: logoutAction,
    },
    {
        path: "/test-progress",
        element: <TestProgress />,
        loader: protectedLoader, // Bảo vệ trang test
    },

]);

export default router;