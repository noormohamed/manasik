"use client";

const RoomRates = () => {
  return (
    <>
      <div className="stay-room-rates box-style">
        <div className="box-title">
          <h4>Room Rates</h4>
          <p>Prices may increase on weekends or holidays</p>
        </div>

        <ul className="p-0 mb-0 list-unstyled">
          <li className="d-flex align-items-center justify-content-between">
            <span>Monday - Thursday</span>
            <span>$199</span>
          </li>
          <li className="d-flex align-items-center justify-content-between">
            <span>Monday - Thursday</span>
            <span>$199</span>
          </li>
          <li className="d-flex align-items-center justify-content-between">
            <span>Friday - Sunday</span>
            <span>$219</span>
          </li>
          <li className="d-flex align-items-center justify-content-between">
            <span>Rent by month</span>
            <span>-8.34 %</span>
          </li>
          <li className="d-flex align-items-center justify-content-between">
            <span>Minimum number of nights</span>
            <span>1 night</span>
          </li>
          <li className="d-flex align-items-center justify-content-between">
            <span>Max number of nights</span>
            <span>90 nights</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default RoomRates;
