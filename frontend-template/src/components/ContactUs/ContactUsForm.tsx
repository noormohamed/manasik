"use client";

import ContactInfo from "./ContactInfo";

const ContactUsForm = () => {
  return (
    <>
      <div className="contat-us-area pb-150">
        <div className="container">
          <div className="section-title">
            <span className="top-title">CONTACT US</span>
            <h2>Stay Connected With Sado</h2>
          </div>

          <div className="row">
            <div className="col-xl-8 mb-5 mb-xl-0">
              <div className="contat-us-form">
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-group mb-4">
                        <input type="text" className="form-control" placeholder="Name" />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group mb-4">
                        <input type="email" className="form-control" placeholder="Email" />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group mb-4">
                        <input type="text" className="form-control" placeholder="Phone" />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group mb-4">
                        <input type="text" className="form-control" placeholder="Subject" />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group mb-4">
                        <textarea className="form-control" cols={30} rows={9} placeholder="Write A Message"></textarea>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group mb-0">
                        <button type="submit" className="default-btn rounded-10 active border-0">
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-xl-4">
              {/* ContactInfo */}
              <ContactInfo />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsForm;
