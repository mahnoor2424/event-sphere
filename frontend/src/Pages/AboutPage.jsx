import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Aboutus from "../Components/Aboutus";

export default function AboutPage() {
  return (
   <>
   <Navbar/>
   <Aboutus/>
   <Footer/>
   </>
  );
}