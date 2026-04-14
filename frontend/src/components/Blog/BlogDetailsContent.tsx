"use client";

import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";

import postImg1 from "/public/images/blog/blog-10.jpg";
import postImg2 from "/public/images/blog/blog-11.jpg";
import postImg3 from "/public/images/blog/blog-12.jpg";

import authorImg1 from "/public/images/author/author-1.jpg"; 
import Comments from "./Comments";

const BlogDetailsContent = () => {
  return (
    <>
      <div className="blog-details-area ptb-175">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="blog-details-content">
                <div className="blog-details-img">
                  <Image src={postImg1} alt="blog" />
                </div>

                <div className="post-info">
                  <div className="text-end">
                    <div className="date">
                      <span className="count">03</span>
                      <span className="mon">Aug</span>
                    </div>
                  </div>
                  <ul className="d-flex align-items-center p-0 list-unstyled">
                    <li>
                      <Link href="/author">
                        <i className="ri-user-line"></i>
                        <span>By Admin</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#">
                        <i className="ri-question-answer-line"></i>
                        <span>No Comment</span>
                      </Link>
                    </li>
                  </ul>
                </div>

                <h2>Things To See And Do When Visiting Japan</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt labore et dolore magna aliqua Ut
                  enim ad minim veniam, quis nostrud exercitation ullamc laboris
                  nisi ut aliquip commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu fugiat
                  nulla pariatur commodo. Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Voluptatem necessita
                </p>

                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum. Sed ut
                  perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium sed doloremque laudantium, totam rem aperiam,
                  eaque ipsa quae ab illo inventore veritatis et quasi
                </p>

                <blockquote className="blockquote">
                  <div className="d-md-flex align-items-center">
                    <div className="flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="70"
                        height="70"
                        viewBox="0 0 70 70"
                        fill="none"
                      >
                        <path
                          d="M24.2312 5.38501H8.07706C5.83317 5.38501 3.92626 6.17035 2.35543 7.74059C0.78534 9.31112 0 11.218 0 13.4621V29.6156C0 31.8595 0.784898 33.7661 2.35543 35.3364C3.92611 36.9065 5.83362 37.6921 8.07706 37.6921H17.5001C18.6215 37.6921 19.5753 38.0849 20.3606 38.87C21.146 39.6546 21.5385 40.6086 21.5385 41.7309V43.0763C21.5385 46.0493 20.4866 48.5865 18.3834 50.6903C16.2801 52.793 13.7423 53.8448 10.769 53.8448H8.07706C7.34742 53.8448 6.71664 54.1119 6.18356 54.6444C5.65091 55.1769 5.38437 55.8081 5.38437 56.5373V61.9226C5.38437 62.6506 5.65091 63.283 6.18356 63.8156C6.71709 64.348 7.34727 64.6153 8.07706 64.6153H10.7692C13.6861 64.6153 16.4696 64.0465 19.12 62.9111C21.7703 61.7755 24.0628 60.2396 25.998 58.3044C27.9328 56.369 29.4684 54.077 30.6041 51.4266C31.7397 48.7763 32.3077 45.993 32.3077 43.0765V13.4615C32.3077 11.2174 31.5223 9.31068 29.9521 7.74044C28.3819 6.1702 26.4745 5.38501 24.2312 5.38501Z"
                          fill="#FF621F"
                        />
                        <path
                          d="M67.6422 7.74059C66.0721 6.17035 64.165 5.38501 61.9211 5.38501H45.7676C43.5237 5.38501 41.6168 6.17035 40.0465 7.74059C38.4765 9.31127 37.6914 11.218 37.6914 13.4621V29.6156C37.6914 31.8595 38.4765 33.7661 40.0465 35.3364C41.6168 36.9065 43.5238 37.6921 45.7676 37.6921H55.1906C56.3121 37.6921 57.2666 38.0849 58.0517 38.87C58.8362 39.655 59.2296 40.6086 59.2296 41.7309V43.0763C59.2296 46.0493 58.1777 48.5865 56.0741 50.6903C53.9709 52.793 51.4337 53.8448 48.4601 53.8448H45.7676C45.0385 53.8448 44.4072 54.1119 43.8747 54.6444C43.3417 55.1769 43.0749 55.8081 43.0749 56.5373V61.9226C43.0749 62.6506 43.3417 63.283 43.8747 63.8156C44.407 64.348 45.0384 64.6153 45.7676 64.6153H48.4601C51.3767 64.6153 54.16 64.0465 56.8107 62.9111C59.4605 61.7755 61.7527 60.2396 63.6881 58.3044C65.6233 56.369 67.1598 54.0764 68.2948 51.4266C69.4302 48.7769 69.9985 45.993 69.9985 43.0765V13.4615C69.998 11.2174 69.2134 9.31068 67.6422 7.74059Z"
                          fill="#FF621F"
                        />
                      </svg>
                    </div>
                    <div className="flex-grow-1 ms-md-4 mt-3 mt-md-0">
                      <p>
                        “ Lorem ipsum dolor sit consectetur adipis sed do
                        eiusmod dolore sit dolore tempor incididunt ut labore
                        dolore mag magna ipsum labor quith.“
                      </p>
                    </div>
                  </div>
                </blockquote>

                <h4>Best Booking Platform In Your Town</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt labore et dolore magna aliqua Ut
                  enim ad minim veniam, quis nostrud exercitation ullamc laboris
                  nisi ut aliquip commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu
                </p>

                <div className="row">
                  <div className="col-lg-6 col-sm-6 mb-24">
                    <Image src={postImg2} alt="blog" />
                  </div>
                  <div className="col-lg-6 col-sm-6 mb-24">
                    <Image src={postImg3} alt="blog" />
                  </div>
                </div>

                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum sed ut
                  perspici unde omnis iste natus error sit voluptatem
                  accusantium sed doloremque
                </p>

                <div className="tag-share">
                  <div className="d-md-flex align-items-center justify-content-between">
                    <ul className="ps-0 pe-0 mb-2 mb-md-0 list-unstyled d-flex align-items-center tag-list">
                      <li>
                        <i className="ri-price-tag-3-fill"></i>
                      </li>
                      <li>
                        <Link href="/tags">Booking</Link>
                      </li>
                      <li>
                        <Link href="/tags">Travel</Link>
                      </li>
                      <li>
                        <Link href="/tags">Enjoy</Link>
                      </li>
                    </ul>

                    <ul className="p-0 mb-0 list-unstyled d-flex align-items-center social-link">
                      <li>
                        <span>Share:</span>
                      </li>
                      <li>
                        <a href="https://www.facebook.com/" target="_blank">
                          <i className="ri-facebook-fill"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.twitter.com/" target="_blank">
                          <i className="ri-twitter-fill"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.pinterest.com/" target="_blank">
                          <i className="ri-pinterest-line"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="author-content">
                  <div className="d-md-flex">
                    <div className="flex-shrink-0">
                      <Image src={authorImg1} alt="author" />
                    </div>
                    <div className="flex-grow-1 ms-md-4 mt-3 mt-md-0">
                      <h4>Sarah Jhonson</h4>
                      <p>
                        Claritas est etiam amet sinicus, qui sequitur lorem
                        ipsum semet coui lectorum orem ipsum dolor voluptatem
                        corporis blanditiis sadipscing elitr sed diam nonumy
                        eirmod amet sit lorem dolore magna aliqua labore dolore
                        aliqua ipsum
                      </p>

                      <ul className="p-0 mb-0 list-unstyled d-flex align-items-center social-link">
                        <li>
                          <a href="https://www.facebook.com/">
                            <i className="ri-facebook-fill"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://www.twitter.com/">
                            <i className="ri-twitter-fill"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://www.pinterest.com/">
                            <i className="ri-pinterest-line"></i>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <Comments />
              </div>
            </div>

            <div className="col-lg-4">
              {/* Sidebar */}
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailsContent;
