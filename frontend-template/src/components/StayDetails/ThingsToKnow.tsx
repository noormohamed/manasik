"use client";

const ThingsToKnow = () => {
  return (
    <>
      <div className="stay-things box-style">
        <div className="box-title">
          <h4>Things to know</h4>
        </div>

        <h6>Cancellation policy</h6>
        <p>
          Refund 50% of the booking value when customers cancel the
          room within 48 hours after successful booking and 14 days
          before the check-in time. Then, cancel the room 14 days
          before the check-in time, get a 50% refund of the total
          amount paid (minus the service fee).
        </p>

        <div className="border"></div>

        <h6>Check-in time</h6>
        <ul className="p-0 mb-0 list-unstyled check-in">
          <li className="d-flex align-items-center justify-content-between">
            <span>Check-in</span>
            <span>08:00 am - 12:00 am</span>
          </li>
          <li className="d-flex align-items-center justify-content-between">
            <span>Check-out</span>
            <span>02:00 pm - 04:00 pm</span>
          </li>
        </ul>

        <div className="border"></div>
        
        <h6>Cancellation policy</h6>
        <ul className="policy">
          <li>
            Ban and I will work together to keep the landscape and
            environment green and clean by not littering, not using
            stimulants and respecting people around.
          </li>
          <li>Do not sing karaoke past 11:30</li>
        </ul>
      </div>
    </>
  );
};

export default ThingsToKnow;
