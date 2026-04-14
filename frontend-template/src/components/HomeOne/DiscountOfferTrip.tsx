"use client"; 

import Link from 'next/link'; 

const DiscountOfferTrip = () => {
  return (
    <>
      <div className="discount-area bg-color-f3f4f6 pt-175 pb-150">
        <div className="container">
          <div 
            className="section-title" 
          >
            <span className="top-title">DISCOUNT OFFER</span>
            <h2>Enjoy the Trip with exciting Discount</h2>
          </div>

          <div className="row justify-content-center">
            <div 
              className="col-lg-3 col-md-6"
            >
              <Link 
                href="/stay-details" 
                className="discount-single-item text-decoration-none d-block"
                style={{ 
                  backgroundImage: `url(/images/discount/discount-1.jpg)`, 
                  height: '245px'
                }}
              >
                <span className="discount">-80%</span>
                <div className="discount-single-content">
                  <h3>France</h3>
                  <span>Louvre Museum</span>
                </div>
              </Link>

              <Link 
                href="/stay-details" 
                className="discount-single-item text-decoration-none d-block"
                style={{ 
                  backgroundImage: `url(/images/discount/discount-2.jpg)`, 
                  height: '245px'
                }}
              > 
                <span className="discount">-80%</span>
                <div className="discount-single-content">
                  <h3>Spain</h3>
                  <span>Royal Palace</span>
                </div>
              </Link>
            </div>

            <div 
              className="col-lg-4 col-md-6"
            >
              <Link 
                href="/stay-details" 
                className="discount-single-item text-decoration-none d-block"
                style={{ 
                  backgroundImage: `url(/images/discount/discount-3.jpg)`, 
                  height: '516px'
                }}
              > 
                <span className="discount">-80%</span>
                <div className="discount-single-content">
                  <h3>America</h3>
                  <span>Metropolitan City</span>
                </div>
              </Link>
            </div>

            <div 
              className="col-lg-5 col-md-12"
            >
              <Link 
                href="/stay-details" 
                className="discount-single-item text-decoration-none d-block"
                style={{ 
                  backgroundImage: `url(/images/discount/discount-4.jpg)`, 
                  height: '245px'
                }}
              > 
                <span className="discount">-80%</span>
                <div className="discount-single-content">
                  <h3>Portugal</h3>
                  <span>Volcanic</span>
                </div>
              </Link>

              <div className="row">
                <div className="col-lg-5 col-md-6 mb-4 mb-lg-0">
                  <Link 
                    href="/stay-details" 
                    className="discount-single-item text-decoration-none d-block mb-0"
                    style={{ 
                      backgroundImage: `url(/images/discount/discount-5.jpg)`, 
                      height: '245px'
                    }}
                  > 
                    <span className="discount">-80%</span>
                    <div className="discount-single-content">
                      <h3>Nepal</h3>
                      <span>Phewa Lake</span>
                    </div>
                  </Link>
                </div>

                <div className="col-lg-7 col-md-6 mb-4 mb-lg-0">
                  <Link 
                    href="/stay-details" 
                    className="discount-single-item objeit-fit-cover mb-0 text-decoration-none d-block"
                    style={{ 
                      backgroundImage: `url(/images/discount/discount-6.jpg)`, 
                      height: '245px'
                    }}
                  > 
                    <span className="discount">-80%</span>
                    <div className="discount-single-content">
                      <h3>Thailand</h3>
                      <span>Grand Palace</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscountOfferTrip;
