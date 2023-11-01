import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import FacilityPage from "./pages/FacilityPage";
import { AuthProvider } from "./utils/auth";
import { RequireAuth } from "./components/RequireAuth";
import ApprovalStatus from "./components/ApprovalStatus";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route
        index
        element={
          <RequireAuth GD={false} FM={false}>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path="auth/login" element={<LoginPage />} />
      <Route
        path="facility/:id"
        element={
          <RequireAuth GD={false} FM={false}>
            <FacilityPage />
          </RequireAuth>
        }
      />
      <Route
        path="employee/approvals/gd"
        element={
          <RequireAuth GD={true} FM={false}>
            <ApprovalStatus />
          </RequireAuth>
        }
      />
    </Route>
  )
);

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
