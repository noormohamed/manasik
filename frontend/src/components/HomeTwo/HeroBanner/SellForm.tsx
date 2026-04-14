"use client";
  
const SellForm = () => {
  return (
    <>
      <form className="buy-sell-form">
        <div className="row">
          <div className="col-lg-3">
            <div className="form-group position-relative">
              <select className="form-select form-control" aria-label="Default select example">
                <option defaultValue="0">Location</option>
                <option defaultValue="1">United Kingdom</option>
                <option defaultValue="2">United State</option>
                <option defaultValue="3">California</option>
              </select>

              <div className="position-absolute top-50 start-0 translate-middle-y">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C4.691 0 2 2.691 2 6C2 10.159 7.416 15.623 7.646 15.854C7.744 15.951 7.872 16 8 16C8.128 16 8.256 15.951 8.354 15.854C8.584 15.623 14 10.159 14 6C14 2.691 11.309 0 8 0ZM8 14.777C6.806 13.499 3 9.177 3 6C3 3.243 5.243 1 8 1C10.757 1 13 3.243 13 6C13 9.174 9.194 13.499 8 14.777Z" fill="#555555"/>
                  <path d="M8 3C6.346 3 5 4.346 5 6C5 7.654 6.346 9 8 9C9.654 9 11 7.654 11 6C11 4.346 9.654 3 8 3ZM8 8C6.897 8 6 7.103 6 6C6 4.897 6.897 4 8 4C9.103 4 10 4.897 10 6C10 7.103 9.103 8 8 8Z" fill="#555555"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="form-group position-relative">
              <select className="form-select form-control" aria-label="Default select example">
                <option defaultValue="0">Property</option>
                <option defaultValue="1">Home</option>
                <option defaultValue="2">Office</option>
                <option defaultValue="3">Store</option>
              </select>
              <div className="position-absolute top-50 start-0 translate-middle-y">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_3609_174)">
                    <path d="M13.3125 15.4994H2.6875C1.89487 15.4994 1.25 14.8546 1.25 14.0619V6.49878C1.25 6.22265 1.47384 5.99878 1.75 5.99878C2.02616 5.99878 2.25 6.22265 2.25 6.49878V14.0619C2.25 14.3032 2.44625 14.4994 2.6875 14.4994H13.3125C13.5538 14.4994 13.75 14.3032 13.75 14.0619V6.49878C13.75 6.22265 13.9738 5.99878 14.25 5.99878C14.5262 5.99878 14.75 6.22265 14.75 6.49878V14.0619C14.75 14.8545 14.1052 15.4994 13.3125 15.4994Z" fill="#555555"/>
                    <path d="M15.5 8.24864C15.372 8.24864 15.2441 8.19983 15.1465 8.10218L8.92805 1.88383C8.41634 1.37208 7.58368 1.37208 7.07193 1.88383L0.853555 8.10221C0.658305 8.29749 0.341711 8.29749 0.146461 8.10221C-0.0488203 7.90696 -0.0488203 7.59036 0.146461 7.39511L6.36484 1.17671C7.26646 0.275082 8.73355 0.275082 9.63515 1.17671L15.8535 7.39508C16.0488 7.59036 16.0488 7.90693 15.8535 8.10218C15.7559 8.19983 15.628 8.24864 15.5 8.24864Z" fill="#555555"/>
                    <path d="M10 15.4995H6C5.72384 15.4995 5.5 15.2756 5.5 14.9995V10.562C5.5 9.70045 6.20094 8.99951 7.0625 8.99951H8.9375C9.79906 8.99951 10.5 9.70045 10.5 10.562V14.9995C10.5 15.2756 10.2762 15.4995 10 15.4995ZM6.5 14.4995H9.5V10.562C9.5 10.2519 9.24766 9.99951 8.9375 9.99951H7.0625C6.75234 9.99951 6.5 10.2519 6.5 10.562V14.4995Z" fill="#555555"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="form-group position-relative">
              <select className="form-select form-control" aria-label="Default select example">
                <option defaultValue="0">Price</option>
                <option defaultValue="1">$1100</option>
                <option defaultValue="2">$1300</option>
                <option defaultValue="3">$2000</option>
              </select>
              <div className="position-absolute top-50 start-0 translate-middle-y">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_3609_179)">
                    <mask id="mask0_3609_179" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                      <path d="M0 9.53674e-07H16V16H0V9.53674e-07Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_3609_179)">
                      <path d="M14.2775 0.468923H8.2051L0.834352 7.83952C0.346883 8.32714 0.346883 9.12498 0.834352 9.61245L6.38757 15.1656C6.87513 15.6531 7.67285 15.6531 8.16048 15.1655L15.5311 7.79486L15.5313 1.72252C15.5312 1.03302 14.967 0.468923 14.2775 0.468923Z" stroke="#555555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12.5782 4.84187C12.1861 5.23403 11.5503 5.23403 11.1581 4.84187C10.766 4.44971 10.766 3.8139 11.1581 3.42184C11.5503 3.02962 12.1861 3.02956 12.5782 3.42184C12.9704 3.8139 12.9704 4.44971 12.5782 4.84187Z" stroke="#555555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="clip0_3609_179">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="form-group">
              <button type="submit" className="default-btn border-0 w-100 d-block">
                Search Now
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default SellForm;
