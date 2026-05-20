import { Outlet } from "react-router-dom";
import ExhibitorDashboardLayout from "../Components/ExhibitorDashboardLayout";

export default function ExhibitorDashboard() {
  return (
   <>
   <ExhibitorDashboardLayout >
   <Outlet />
   </ExhibitorDashboardLayout >
   </>
  );
}