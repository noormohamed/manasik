"use client";

import Image from "next/image";

import pageBanner from "/public/images/page-banner/page-banner-img-4.jpg";
import mokaup from "/public/images/mokaup/mokup-11.png";

const PageBanner = () => {
  return (
    <>
      <div className="page-banner-area overflow-hidden">
        <div className="container-fluid mw-1640">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <div className="page-banner-content">
                <h2>Toronto Canada</h2>

                <ul className="p-0 mb-0 list-unstyled d-flex align-items-center  justify-content-center justify-content-md-start style-two">
                  <li className="d-flex align-items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M9 0C5.27737 0 2.25 3.02737 2.25 6.75C2.25 11.4289 8.343 17.5759 8.60175 17.8358C8.712 17.9449 8.856 18 9 18C9.144 18 9.288 17.9449 9.39825 17.8358C9.657 17.5759 15.75 11.4289 15.75 6.75C15.75 3.02737 12.7226 0 9 0ZM9 16.6241C7.65675 15.1864 3.375 10.3241 3.375 6.75C3.375 3.64838 5.89838 1.125 9 1.125C12.1016 1.125 14.625 3.64838 14.625 6.75C14.625 10.3208 10.3433 15.1864 9 16.6241Z"
                        fill="#555555"
                      />
                      <path
                        d="M9 3.375C7.13925 3.375 5.625 4.88925 5.625 6.75C5.625 8.61075 7.13925 10.125 9 10.125C10.8608 10.125 12.375 8.61075 12.375 6.75C12.375 4.88925 10.8608 3.375 9 3.375ZM9 9C7.75912 9 6.75 7.99088 6.75 6.75C6.75 5.50912 7.75912 4.5 9 4.5C10.2409 4.5 11.25 5.50912 11.25 6.75C11.25 7.99088 10.2409 9 9 9Z"
                        fill="#555555"
                      />
                    </svg>
                    <span>Canada</span>
                  </li>

                  <li className="d-flex align-items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_3715_2131)">
                        <path
                          d="M14.9766 17.4367H3.02344C2.13173 17.4367 1.40625 16.7113 1.40625 15.8196V7.31104C1.40625 7.00039 1.65807 6.74854 1.96875 6.74854C2.27943 6.74854 2.53125 7.00039 2.53125 7.31104V15.8196C2.53125 16.091 2.75203 16.3117 3.02344 16.3117H14.9766C15.248 16.3117 15.4688 16.091 15.4688 15.8196V7.31104C15.4688 7.00039 15.7206 6.74854 16.0312 6.74854C16.3419 6.74854 16.5938 7.00039 16.5938 7.31104V15.8196C16.5938 16.7113 15.8683 17.4367 14.9766 17.4367Z"
                          fill="#555555"
                        />
                        <path
                          d="M17.4375 9.27966C17.2935 9.27966 17.1496 9.22475 17.0398 9.11489L10.0441 2.11925C9.46838 1.54353 8.53164 1.54353 7.95592 2.11925L0.960249 9.11492C0.740593 9.33461 0.384425 9.33461 0.164769 9.11492C-0.0549229 8.89527 -0.0549229 8.5391 0.164769 8.31944L7.16044 1.32373C8.17477 0.309406 9.82525 0.309406 10.8395 1.32373L17.8352 8.31941C18.0549 8.5391 18.0549 8.89523 17.8352 9.11489C17.7254 9.22475 17.5815 9.27966 17.4375 9.27966Z"
                          fill="#555555"
                        />
                        <path
                          d="M11.25 17.4368H6.75C6.43932 17.4368 6.1875 17.1849 6.1875 16.8743V11.8821C6.1875 10.9128 6.97605 10.1243 7.94531 10.1243H10.0547C11.0239 10.1243 11.8125 10.9128 11.8125 11.8821V16.8743C11.8125 17.1849 11.5607 17.4368 11.25 17.4368ZM7.3125 16.3118H10.6875V11.8821C10.6875 11.5332 10.4036 11.2493 10.0547 11.2493H7.94531C7.59639 11.2493 7.3125 11.5332 7.3125 11.8821V16.3118Z"
                          fill="#555555"
                        />
                      </g>
                    </svg>
                    <span>110 Properties</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="page-banner-img position-relative z-1">
                <Image src={pageBanner} alt="banner" />
                <Image
                  src={mokaup}
                  className="mokup-11 position-absolute top-0 start-0 end-0 w-100 h-100"
                  alt="mokup"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageBanner;
