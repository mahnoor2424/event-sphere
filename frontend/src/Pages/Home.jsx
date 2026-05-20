import React from 'react';
import "../App.css";
import Hero from '../Components/Hero';
import About from '../Components/About';
import Services from '../Components/Service';
import Navbar from '../Components/Navbar';
import FeaturedEvents from '../Components/FeaturedEvents';
import ScheduleData from '../Components/ScheduleData';
import Footer from '../Components/Footer';
import ExpoStats from '../Components/ExpoStats';
import CTA from '../Components/CTA';
import Testimonials from '../Components/Testimonials';
import Blogs from '../Components/Blogs';

export default function Home() {
  return (
   <>
    <Navbar/>
   <section id="home"><Hero /></section>
   <section id="about"><About/></section>
   <section id="services"><Services/></section>
   <section id="featured"><FeaturedEvents/></section>
   <section id="testimonials"><Testimonials/></section>
   <section id='blogs'><Blogs/></section>
   <section id="cta"><CTA/></section>
   <Footer/>
   </>
  );
}