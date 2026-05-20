import React from "react";
import "../App.css";

export default function EventShowcase() {
  return (
    <section className="event-showcase">

      <div className="container">

        {/* DATE */}
        <div className="event-date">
          <h1>
            <span>March</span>
            <span className="gradient">12 - 18</span>
          </h1>
        </div>

        {/* MAIN CONTENT */}
        <div className="event-content">

          {/* LEFT IMAGES */}
          <div className="event-images">

            <img
              src="/assets/hero1.webp"
              className="img-main"
              alt="event"
            />

            <img
              src="/assets/hero3.jpg"
              className="img-pattern"
              alt="pattern"
            />

            <div className="img-bg"></div>

          </div>

          {/* RIGHT CONTENT */}
          <div className="event-text">

            <h2>
              Welcome to the <span className="line">Biggest</span>{" "}
              <span className="gradient">EventSphere Expo 2026</span>
            </h2>

            <div className="event-desc">
              <div className="arrow">
                ➜
              </div>

              <p>
                EventSphere is a premium event management experience bringing
                together innovation, exhibitions, corporate networking, and
                tech conferences. Discover future trends, connect with industry
                leaders, and explore immersive experiences.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}