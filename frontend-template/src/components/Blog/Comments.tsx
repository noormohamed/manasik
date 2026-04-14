"use client";

import Image from "next/image"; 
import Link from "next/link";

import authorImg2 from "/public/images/author/author-2.jpg";
import authorImg3 from "/public/images/author/author-2.jpg";

const Comments = () => {
  return (
    <>
      <div className="comment-list">
        <h2>02 Comments</h2>

        <ul className="p-0 mb-0 list-unstyled">
          <li>
            <div className="d-md-flex">
              <div className="flex-shrink-0">
                <Image src={authorImg2} alt="author" />
              </div>
              <div className="flex-grow-1 ms-md-4 mt-3 mt-md-0">
                <h4>Runald Trump</h4>
                <span className="date">June 20, 2023 | 07:10 PM</span>
                <p className="mb-0">
                  Lorem ipsum dolor sit amet consetetur sadipscing
                  elitr sed diam nonumy eirmod tempor invidunt ut
                  labore et dolore magna aliquyam erat dolore magna
                  ipsum
                </p>
                <Link href="#" className="reply">
                  Reply
                </Link>
              </div>
            </div>
          </li>

          <li>
            <div className="d-md-flex">
              <div className="flex-shrink-0">
                <Image src={authorImg3} alt="author" />
              </div>
              <div className="flex-grow-1 ms-md-4 mt-3 mt-md-0">
                <h4>Markuis Lubna</h4>
                <span className="date">June 20, 2023 | 07:10 PM</span>
                <p className="mb-0">
                  Lorem ipsum dolor sit amet consetetur sadipscing
                  elitr sed diam nonumy eirmod tempor invidunt ut
                  labore et dolore magna aliquyam erat dolore magna
                  ipsum
                </p>
                <Link href="#" className="reply">
                  Reply
                </Link>
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      {/* Comments Form */}
      <div className="comment-replay">
        <h4>Leave A Reply</h4>
        <p>
          Your email address will not be published. Required fields
          are marked
        </p>

        <form>
          <div className="row">
            <div className="col-lg-6">
              <div className="form-group mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group mb-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                />
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group mb-4">
              <textarea
                className="form-control"
                placeholder="Comment"
                cols={30}
                rows={10}
              ></textarea>
            </div>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="default-btn active rounded-10 border-0"
            >
              Post A Comment
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Comments;
