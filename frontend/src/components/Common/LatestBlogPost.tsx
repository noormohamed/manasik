"use client";

import Image from "next/image";
import Link from "next/link";

import postImg1 from "/public/images/blog/blog-1.jpg";
import postImg2 from "/public/images/blog/blog-2.jpg";

const LatestBlogPost = () => {
  return (
    <>
      <div className="blog-area bg-color-f3f4f6 pt-175 pb-150">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div 
              className="col-xl-4 col-md-6"
            >
              <div className="blog-content">
                <span className="top-title">LATEST BLOG</span>
                <h2>Enjoy the Trip with exciting Discount</h2>
                <p>Lorem ipsum dolor sit amet consectetur incididunt labore et dolore magna aliqua quis ipsum</p>
                  
                <Link href="/blog" className="default-btn active rounded-10">
                  View All Blog
                </Link>
              </div>
            </div>

            <div 
              className="col-xl-4 col-md-6"
            >
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg1} alt="blog" />
                  <div className="date">
                    <span className="count">03</span>
                    <span className="mon">Aug</span>
                  </div>
                </Link>

                <div className="blog-single-content">
                  <ul className="d-flex align-items-center p-0 list-unstyled">
                    <li>
                      <Link href="/author">
                        <i className="ri-user-line"></i>
                        <span>By Admin</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog/blog-details">
                        <i className="ri-question-answer-line"></i>
                        <span>No Comment</span>
                      </Link>
                    </li>
                  </ul>
                  <h4>
                    <Link href="/blog/blog-details">Things To See And Do When Visiting Japan</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div 
              className="col-xl-4 col-md-6"
            >
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg2} alt="blog" />
                  <div className="date">
                    <span className="count">04</span>
                    <span className="mon">Aug</span>
                  </div>
                </Link>

                <div className="blog-single-content">
                  <ul className="d-flex align-items-center p-0 list-unstyled">
                    <li>
                      <Link href="/author">
                        <i className="ri-user-line"></i>
                        <span>By Admin</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog/blog-details">
                        <i className="ri-question-answer-line"></i>
                        <span>No Comment</span>
                      </Link>
                    </li>
                  </ul>
                  <h4>
                    <Link href="/blog/blog-details">Travel The Most Beautiful Places In the World</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LatestBlogPost;
