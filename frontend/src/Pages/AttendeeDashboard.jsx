import React from "react";
import DashboardLayout from "../Components/AttendeeDashboardLayout";
import { Outlet } from "react-router-dom";

export default function AttendeeDashboard() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}