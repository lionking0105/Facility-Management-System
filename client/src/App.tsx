import "@tanstack/react-query";
import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
  RouterProvider,
} from "react-router-dom";
import { AxiosError } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import FacilityPage from "./pages/FacilityPage";
import { AuthProvider } from "./utils/auth";
import { RequireAuth } from "./components/RequireAuth";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminFacilitiesPage from "./pages/AdminFacilitiesPage";
import Layout from "./components/Layout";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PageNotFound from "./components/PageNotFound";
import SetUser from "./pages/SetUser";
import FMApprovalsPage from "./pages/FMApprovalsPage";
import GDApprovalsPage from "./pages/GDApprovalsPage";
import FMCancellationsPage from "./pages/FMCancellationPage";
import GDCancellationsPage from "./pages/GDCancellationsPage";
import FMBookingsPage from "./pages/FMBookingsPage";
import GDBookingsPage from "./pages/GDBookingsPage";
import RouteError from "./components/RouteError";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AxiosError;
  }
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/auth">
        <Route index element={<SetUser />} errorElement={<RouteError />} />
        <Route
          path="login"
          element={<LoginPage />}
          errorElement={<RouteError />}
        />
        <Route
          path="reset-password"
          element={
            <RequireAuth GD={false} FM={false} Admin={true}>
              <ResetPasswordPage />
            </RequireAuth>
          }
          errorElement={<RouteError />}
        />
      </Route>

      <Route
        path="/"
        element={
          <RequireAuth GD={false} FM={false}>
            <Layout />
          </RequireAuth>
        }
        errorElement={<RouteError />}
      >
        <Route
          index
          element={
            <RequireAuth GD={false} FM={false} noAdmin={true}>
              <DashboardPage />
            </RequireAuth>
          }
          errorElement={<RouteError />}
        />

        <Route path="facility">
          <Route
            path=":id"
            element={
              <RequireAuth GD={false} FM={false} noAdmin={true}>
                <FacilityPage />
              </RequireAuth>
            }
            errorElement={<RouteError />}
          />
        </Route>

        <Route path="bookings">
          <Route
            path="gd"
            element={
              <RequireAuth GD={true} FM={false} noAdmin={true}>
                <GDBookingsPage />
              </RequireAuth>
            }
            errorElement={<RouteError />}
          />
          <Route
            path="fm"
            element={
              <RequireAuth GD={false} FM={true} noAdmin={true}>
                <FMBookingsPage />
              </RequireAuth>
            }
            errorElement={<RouteError />}
          />
        </Route>

        <Route path="employee">
          <Route path="approvals">
            <Route
              path="gd"
              element={
                <RequireAuth GD={true} FM={false} noAdmin={true}>
                  <GDApprovalsPage />
                </RequireAuth>
              }
              errorElement={<RouteError />}
            />
            <Route
              path="fm"
              element={
                <RequireAuth GD={false} FM={true} noAdmin={true}>
                  <FMApprovalsPage />
                </RequireAuth>
              }
              errorElement={<RouteError />}
            />
          </Route>

          <Route path="cancellations">
            <Route
              path="gd"
              element={
                <RequireAuth GD={true} FM={false} noAdmin={true}>
                  <GDCancellationsPage />
                </RequireAuth>
              }
              errorElement={<RouteError />}
            />
            <Route
              path="fm"
              element={
                <RequireAuth GD={false} FM={true} noAdmin={true}>
                  <FMCancellationsPage />
                </RequireAuth>
              }
              errorElement={<RouteError />}
            />
          </Route>

          <Route
            path="mybookings"
            element={
              <RequireAuth GD={false} FM={false} noAdmin={true}>
                <MyBookingsPage />
              </RequireAuth>
            }
            errorElement={<RouteError />}
          />
        </Route>

        <Route path="admin">
          <Route
            path="bookings"
            element={
              <RequireAuth GD={false} FM={false} Admin={true}>
                <AdminBookingsPage />
              </RequireAuth>
            }
            errorElement={<RouteError />}
          />
          <Route
            path="facilities"
            element={
              <RequireAuth GD={false} FM={false} Admin={true}>
                <AdminFacilitiesPage />
              </RequireAuth>
            }
            errorElement={<RouteError />}
          />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </>
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
