"use client";

const FilterHeader = () => {
  return (
    <>
      <div className="d-xxl-flex justify-content-between align-items-center mb-70">
        <div className="section-title mb-0 left-title">
          <h2>Stays In Toronto</h2>
          <p>130 stays  ·  Aug 10 - 18  ·  6 Guests</p>
        </div>

        <ul className="ps-0 pe-0 mb-0 mt-4 mt-xxl-0 list-unstyled d-lg-flex align-items-center filter-drop">
          <li className="ms-0">
            <select className="form-select form-control">
              <option defaultValue="0">Type Of Place</option>
              <option defaultValue="1">Canada</option>
              <option defaultValue="2">Unaited Kingdom</option>
            </select>
          </li>
          <li>
            <button type="submit" className="opacity-btn">
              <span>$0-$1,000</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <g clipPath="url(#clip0_3719_2461)">
                  <path d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0ZM11.138 10.1953L10.1953 11.138L8 8.94267L5.80467 11.138L4.862 10.1953L7.05734 8L4.862 5.80467L5.80467 4.862L8 7.05733L10.1953 4.862L11.138 5.80467L8.94267 8L11.138 10.1953Z" fill="#FF621F"/>
                </g>
              </svg>
            </button>
          </li>
          <li>
            <select className="form-select form-control">
              <option defaultValue="0">Rooms Of Beds</option>
              <option defaultValue="1">3</option>
              <option defaultValue="2">5</option>
            </select>
          </li>
          <li>
            <button type="submit" className="opacity-btn">
              <span>More Filters (3)</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <g clipPath="url(#clip0_3719_2461)">
                  <path d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0ZM11.138 10.1953L10.1953 11.138L8 8.94267L5.80467 11.138L4.862 10.1953L7.05734 8L4.862 5.80467L5.80467 4.862L8 7.05733L10.1953 4.862L11.138 5.80467L8.94267 8L11.138 10.1953Z" fill="#FF621F"/>
                </g>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default FilterHeader;
