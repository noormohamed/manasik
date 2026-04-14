"use client";

import Link from 'next/link';

const PopularDestinationWeOffer = () => {
  return (
    <>
      <div className="offer-area position-relative z-1">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="metadata" 
          className="background-video"
        >
          <source src="/images/offer-bg.mp4" type="video/mp4" />
        </video>

        <div className="container">
          <div 
            className="offer-content"
          >
            <h2>Popular Destination we offer for all</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit do eiusmod incididunt ut labore et dolore magna aliqua quis ipsum suspendisse ultrice risus commodo viverra maecenas accumsan lacus dolore magna</p>

            <div className="offer-content-btn">
              <Link href="/contact-us" className="default-btn rounded-10">
                Contact Us Now
              </Link>
              <Link href="/subscription" className="bg-transparent default-btn">
                Show Me More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopularDestinationWeOffer;
