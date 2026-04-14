"use client";

import Image from "next/image";
import Link from "next/link";

import postImg1 from "/public/images/blog/blog-1.jpg";
import postImg2 from "/public/images/blog/blog-2.jpg";
import postImg3 from "/public/images/blog/blog-3.jpg";

const Sidebar = () => {
  return (
    <>
      <div className="blog-details-sidebar">
        <div className="single-sidebar-item">
          <div className="position-relative z-1">
            <input type="text" className="form-control" placeholder="Search" />
            <button
              type="submit"
              className="src-btn position-absolute top-50 end-0 translate-middle-y"
            >
              <i className="flaticon-loupe"></i>
            </button>
          </div>
        </div>

        <div className="single-sidebar-item">
          <h4>Popular Blog</h4>

          <Link
            href="/blog/blog-details"
            className="d-flex align-items-center popular-post"
          >
            <div className="flex-shrink-0">
              <Image src={postImg1} alt="blog" />
            </div>
            <div className="flex-grow-1 ms-3">
              <span className="date">08 Aug 2023</span>
              <h3>Things To See And Do When Visiting Japan</h3>
            </div>
          </Link>

          <Link
            href="/blog/blog-details"
            className="d-flex align-items-center popular-post"
          >
            <div className="flex-shrink-0">
              <Image src={postImg2} alt="blog" />
            </div>
            <div className="flex-grow-1 ms-3">
              <span className="date">08 Aug 2023</span>
              <h3>Mexico Trip Impressions Of A Challenging Journey</h3>
            </div>
          </Link>

          <Link
            href="/blog/blog-details"
            className="d-flex align-items-center popular-post mb-0"
          >
            <div className="flex-shrink-0">
              <Image src={postImg3} alt="blog" />
            </div>
            <div className="flex-grow-1 ms-3">
              <span className="date">08 Aug 2023</span>
              <h3>5 Days In A Quiet Place Near Silicon Nepal</h3>
            </div>
          </Link>
        </div>

        <div className="single-sidebar-item">
          <h4>Categories</h4>

          <ul className="p-0 mb-0 list-unstyled categories">
            <li>
              <Link href="/categories">Cost-effective advertising</Link>
            </li>
            <li>
              <Link href="/categories">Reach millions with Chisfis</Link>
            </li>
            <li>
              <Link href="/categories">Secure and simple</Link>
            </li>
            <li>
              <Link href="/categories">Book & relax</Link>
            </li>
            <li>
              <Link href="/categories">Smart checklist</Link>
            </li>
          </ul>
        </div>

        <div className="single-sidebar-item">
          <h4>Tags</h4>

          <ul className="p-0 mb-0 list-unstyled tags">
            <li>
              <Link href="/tags">Travel</Link>
            </li>
            <li>
              <Link href="/tags">Journey</Link>
            </li>
            <li>
              <Link href="/tags">Trip</Link>
            </li>
            <li>
              <Link href="/tags">Online</Link>
            </li>
            <li>
              <Link href="/tags">Booking</Link>
            </li>
            <li>
              <Link href="/tags">First</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
