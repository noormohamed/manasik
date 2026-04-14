"use client";

import React, { useState } from "react";
import FsLightbox from "fslightbox-react";

const OurHottestVideos = () => {
  // To open the lightbox change the value of the "toggler" prop.
  const [toggler, setToggler] = useState<boolean>(false);

  return (
    <>
      {/* Use here youtube Embed video link */}
      <FsLightbox
        toggler={toggler}
        sources={[
          "https://www.youtube.com/embed/DLgrKBUwsBc?si=lo3B5zo4et1Zbtnl",
        ]}
      />

      <div className="the-video-area pt-175 pb-150">
        <div className="container">
          <div 
            className="section-title left-title mb-70"
          >
            <span className="top-title">THE VIDEOS</span>
            <h2>Check Out Our Hottest Videos</h2>
          </div>

          <div 
            className="row"
          >
            <div className="col-lg-4 col-md-4">
              <div
                className="video-songle-item position-relative"
                style={{
                  backgroundImage: `url(/images/video/video-1.jpg)`,
                  height: "260px",
                }}
              >
                <div
                  className="video-btn position-absolute top-50 start-50 translate-middle"
                  onClick={() => setToggler(!toggler)}
                >
                  <i className="ri-play-fill"></i>
                </div>
              </div>

              <div
                className="video-songle-item position-relative"
                style={{
                  backgroundImage: `url(/images/video/video-2.jpg)`,
                  height: "260px",
                }}
              >
                <div
                  className="video-btn position-absolute top-50 start-50 translate-middle"
                  onClick={() => setToggler(!toggler)}
                >
                  <i className="ri-play-fill"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-8 col-md-8">
              <div
                className="video-songle-item position-relative"
                style={{
                  backgroundImage: `url(/images/video/video-3.jpg)`,
                  height: "540px",
                }}
              >
                <div
                  className="video-btn v-btn position-absolute top-50 start-50 translate-middle"
                  onClick={() => setToggler(!toggler)}
                >
                  <i className="ri-play-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OurHottestVideos;
