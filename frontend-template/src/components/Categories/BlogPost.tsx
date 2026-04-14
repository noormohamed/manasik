"use client";

import Image from "next/image";
import Link from "next/link";

import postImg1 from "/public/images/blog/blog-1.jpg";
import postImg2 from "/public/images/blog/blog-2.jpg";
import postImg3 from "/public/images/blog/blog-3.jpg";
import postImg4 from "/public/images/blog/blog-4.jpg";
import postImg5 from "/public/images/blog/blog-5.jpg";
import postImg6 from "/public/images/blog/blog-6.jpg";
import postImg7 from "/public/images/blog/blog-7.jpg";
import postImg8 from "/public/images/blog/blog-8.jpg";
import postImg9 from "/public/images/blog/blog-9.jpg";

const BlogPost = () => {
  return (
    <>
      <div className="blog-area ptb-175">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-12 col-md-12">
    	        <div className="search-tags">
                <h1>Categories: <strong>Listing</strong></h1>
    	        </div>
            </div>

            <div className="col-xl-4 col-md-6">
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

            <div className="col-xl-4 col-md-6">
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
                    <Link href="/blog/blog-details">24 Of Our Favourite Things To Do In Cape Town</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg3} alt="blog" />
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

            <div className="col-xl-4 col-md-6">
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg4} alt="blog" />
                  <div className="date">
                    <span className="count">06</span>
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
                    <Link href="/blog/blog-details">Mexico Trip Impressions Of A Challenging Journey</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg5} alt="blog" />
                  <div className="date">
                    <span className="count">07</span>
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
                    <Link href="/blog/blog-details">5 Days In A Quiet Place Near Silicon Nepal</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg6} alt="blog" />
                  <div className="date">
                    <span className="count">08</span>
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
                    <Link href="/blog/blog-details">10 Tips To Book Best Hotel For You Nice Trips</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg7} alt="blog" />
                  <div className="date">
                    <span className="count">10</span>
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
                    <Link href="/blog/blog-details">Our Favourite Things To Do In The City</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg8} alt="blog" />
                  <div className="date">
                    <span className="count">11</span>
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
                    <Link href="/blog/blog-details">Durmitor National Park & Zabljak Montenegro</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="blog-single-item">
                <Link href="/blog/blog-details" className="d-block blog-single-img">
                  <Image src={postImg9} alt="blog" />
                  <div className="date">
                    <span className="count">08</span>
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
                    <Link href="/blog/blog-details">How To Pack For The Camino De Santiago Sydny</Link>
                  </h4>
                  <Link href="/blog/blog-details" className="read-more">Read More</Link>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="pagination-area text-center">
                <Link href="#" className="next page-numbers">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <g clipPath="url(#clip0_3719_2626)">
                      <path d="M3.60973 7.0177L10.4279 0.199699C10.6941 -0.0665738 11.1259 -0.0665739 11.3921 0.199744C11.6584 0.466017 11.6584 0.897699 11.3921 1.16397L5.05605 7.49988L11.3921 13.8361C11.6584 14.1024 11.6584 14.5341 11.3921 14.8003C11.259 14.9335 11.0845 15 10.91 15C10.7355 15 10.561 14.9335 10.4279 14.8003L3.60973 7.98192C3.48182 7.85406 3.41 7.68065 3.41 7.49983C3.41 7.31902 3.48182 7.14556 3.60973 7.0177Z" fill="#111827"/>
                    </g>
                  </svg>
                </Link>
        
                <span className="page-numbers" aria-current="page">1</span>
                <Link href="#" className="page-numbers current">2</Link>
                <Link href="#" className="page-numbers">3</Link>
                
                <Link href="#" className="next page-numbers">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <g clipPath="url(#clip0_3719_2622)">
                      <path d="M11.3903 7.0177L4.57209 0.199699C4.30587 -0.0665738 3.87414 -0.0665739 3.60787 0.199744C3.34164 0.466017 3.34164 0.897699 3.60791 1.16397L9.94395 7.49988L3.60787 13.8361C3.34164 14.1024 3.34164 14.5341 3.60791 14.8003C3.741 14.9335 3.9155 15 4.09 15C4.2645 15 4.439 14.9335 4.57214 14.8003L11.3903 7.98192C11.5182 7.85406 11.59 7.68065 11.59 7.49983C11.59 7.31901 11.5182 7.14556 11.3903 7.0177Z" fill="#111827"/>
                    </g>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
