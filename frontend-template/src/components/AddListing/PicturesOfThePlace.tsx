"use client";
 
import Link from "next/link";
import Image from "next/image"; 

import coverImage from "/public/images/popular/popular-7.jpg"; 
import placePicture from "/public/images/popular/popular-8.jpg"; 
  
const PicturesOfThePlace = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Pictures Of The Place</h4>
                <p>A few beautiful photos will help customers have more sympathy for your property.</p>
              </div>
              
              <div className="form-group">
                <label className="mb-3">Cover image</label>
                <div className="drop-zone">
                  <input id="file-upload" type="file" />
                </div>

                <div className="form-text mt-2">Upload a file or drag and drop PNG, JPG, GIF up to 10MB</div>

                <div className="mt-3">
                  <Image src={coverImage} alt="coverImage" width={200} className="rounded" />
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="mb-3">Pictures of the place</label>
                <div className="drop-zone">
                  <input id="file-upload" type="file" />
                </div>
                
                <div className="form-text mt-2">Upload a file or drag and drop PNG, JPG, GIF up to 10MB</div>

                <div className="mt-3">
                  <Image src={placePicture} alt="coverImage" width={200} className="rounded" />
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <Link href="/add-listing/six" className="default-btn white-btn rounded-10">
                Go Back
              </Link>
              <Link href="/add-listing/eight" className="default-btn active rounded-10">
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PicturesOfThePlace;
