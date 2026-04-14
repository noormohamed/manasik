"use client";

import Link from "next/link";

const Amenities = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Amenities</h4>
                <span>
                  Many customers have searched for accommodation based on
                  amenities criteria
                </span>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">General amenities</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="wifi"
                      />
                      <label className="form-check-label" htmlFor="wifi">
                        Wifi
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="airConditioning"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="airConditioning"
                      >
                        Air conditioning
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="dryer"
                      />
                      <label className="form-check-label" htmlFor="dryer">
                        Dryer
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="detergent"
                      />
                      <label className="form-check-label" htmlFor="detergent">
                        Detergent
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="desk"
                      />
                      <label className="form-check-label" htmlFor="desk">
                        Desk
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="internet"
                      />
                      <label className="form-check-label" htmlFor="internet">
                        Internet
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="fan"
                      />
                      <label className="form-check-label" htmlFor="fan">
                        Fan
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="heater"
                      />
                      <label className="form-check-label" htmlFor="heater">
                        Heater
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="clothesDryer"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="clothesDryer"
                      >
                        Clothes dryer
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="fridge"
                      />
                      <label className="form-check-label" htmlFor="fridge">
                        Fridge
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="tv"
                      />
                      <label className="form-check-label" htmlFor="tv">
                        TV
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="privateEntrance"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="privateEntrance"
                      >
                        Private entrance
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="wshingMachine"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="wshingMachine"
                      >
                        Washing machine
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="babyCot"
                      />
                      <label className="form-check-label" htmlFor="babyCot">
                        Baby cot
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="dryer"
                      />
                      <label className="form-check-label" htmlFor="dryer">
                        Dryer
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">Other amenities</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="wardrobe"
                      />
                      <label className="form-check-label" htmlFor="wardrobe">
                        Wardrobe
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="gasStove"
                      />
                      <label className="form-check-label" htmlFor="gasStove">
                        Gas stove
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="makeupTable"
                      />
                      <label className="form-check-label" htmlFor="makeupTable">
                        Makeup table
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="kettle"
                      />
                      <label className="form-check-label" htmlFor="kettle">
                        Kettle
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="toaster"
                      />
                      <label className="form-check-label" htmlFor="toaster">
                        Toaster
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="clothHook"
                      />
                      <label className="form-check-label" htmlFor="clothHook">
                        Cloth hook
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="toiletPaper"
                      />
                      <label className="form-check-label" htmlFor="toiletPaper">
                        Toilet paper
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="hotPot"
                      />
                      <label className="form-check-label" htmlFor="hotPot">
                        Hot pot
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="dishwasher"
                      />
                      <label className="form-check-label" htmlFor="dishwasher">
                        Dishwasher
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="towel"
                      />
                      <label className="form-check-label" htmlFor="towel">
                        Towel
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="extraCushion"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="extraCushion"
                      >
                        Extra cushion
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="freeToiletries"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="freeToiletries"
                      >
                        Free toiletries
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="bathroomHeaters"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="bathroomHeaters"
                      >
                        Bathroom heaters
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="bbqGrill"
                      />
                      <label className="form-check-label" htmlFor="bbqGrill">
                        BBQ grill
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="diningTable"
                      />
                      <label className="form-check-label" htmlFor="diningTable">
                        Dining table
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">Safe amenities</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="fireSiren"
                      />
                      <label className="form-check-label" htmlFor="fireSiren">
                        Fire siren
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="safeVault"
                      />
                      <label className="form-check-label" htmlFor="safeVault">
                        Safe vault
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="fireExtinguisher"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="fireExtinguisher"
                      >
                        Fire extinguisher
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="antiTheftKey"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="antiTheftKey"
                      >
                        Anti-theft key
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing/three"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <Link
                href="/add-listing/five"
                className="default-btn active rounded-10"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Amenities;
