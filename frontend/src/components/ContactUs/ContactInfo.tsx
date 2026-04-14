"use client";

const ContactInfo = () => {
  return (
    <>
      <ul className="contact-us-info p-0 mb-0 list-unstyled mt-4 mt-lg-0">
        <li>
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <i className="flaticon-phone-call"></i>
            </div>
            <div className="flex-grow-1 ms-4">
              <h4>Phone Number</h4>
              <a href="tel:+981234567890">+98 12345 67890</a>
              <a href="tel:+000123456789">+000 123 456 789</a>
            </div>
          </div>
        </li>

        <li>
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <i className="flaticon-envelope"></i>
            </div>
            <div className="flex-grow-1 ms-4">
              <h4>Email Address</h4>
              <a href="mailto:inforist@technology.com">inforist@technology.com</a>
              <a href="mailto:hellotofy@solution69.com">hellotofy@solution69.com</a>
            </div>
          </div>
        </li>
        
        <li>
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <i className="flaticon-location"></i>
            </div>
            <div className="flex-grow-1 ms-4">
              <h4>Our Location</h4>
              <p>70-80 Upper St Norwich NR2 London United Kingdom</p>
            </div>
          </div>
        </li>
      </ul>
    </>
  );
};

export default ContactInfo;
