import React from "react";
import DashboardLayout from "../Components/DashboardLayout";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}