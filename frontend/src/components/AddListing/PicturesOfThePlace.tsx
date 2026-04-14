"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import Image from "next/image";

const PicturesOfThePlace = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();

  const [coverImage, setCoverImage] = useState(listingData.coverImage || '');
  const [photos, setPhotos] = useState<string[]>(listingData.photos || []);

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(6);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({ coverImage, photos });
  }, [coverImage, photos]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    updateListing({ coverImage, photos });
    router.push('/add-listing/eight');
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Create Listing - Photos</h4>
                <p>Beautiful photos help guests choose your property. Add at least one cover image.</p>
              </div>
              
              <div className="form-group">
                <label className="mb-3">Cover image</label>
                <div className="drop-zone" style={{ 
                  border: '2px dashed #ddd', 
                  borderRadius: '8px', 
                  padding: '30px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#fafafa'
                }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    style={{ display: 'none' }}
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" style={{ cursor: 'pointer', margin: 0 }}>
                    <i className="ri-upload-cloud-line" style={{ fontSize: '32px', color: '#888' }}></i>
                    <p style={{ margin: '10px 0 0', color: '#666' }}>Click to upload cover image</p>
                  </label>
                </div>
                <div className="form-text mt-2">PNG, JPG, GIF up to 10MB</div>

                {coverImage && (
                  <div className="mt-3 position-relative" style={{ display: 'inline-block' }}>
                    <img 
                      src={coverImage} 
                      alt="Cover" 
                      style={{ width: '200px', borderRadius: '8px', objectFit: 'cover', height: '150px' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        lineHeight: '24px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group mb-0">
                <label className="mb-3">Additional photos</label>
                <div className="drop-zone" style={{ 
                  border: '2px dashed #ddd', 
                  borderRadius: '8px', 
                  padding: '30px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#fafafa'
                }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={handlePhotosChange}
                    style={{ display: 'none' }}
                    id="photos-upload"
                  />
                  <label htmlFor="photos-upload" style={{ cursor: 'pointer', margin: 0 }}>
                    <i className="ri-image-add-line" style={{ fontSize: '32px', color: '#888' }}></i>
                    <p style={{ margin: '10px 0 0', color: '#666' }}>Click to upload additional photos</p>
                  </label>
                </div>
                <div className="form-text mt-2">You can select multiple images</div>

                {photos.length > 0 && (
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="position-relative" style={{ display: 'inline-block' }}>
                        <img 
                          src={photo} 
                          alt={`Photo ${index + 1}`} 
                          style={{ width: '120px', height: '90px', borderRadius: '8px', objectFit: 'cover' }} 
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            lineHeight: '20px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.push('/add-listing/six')}
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="default-btn active rounded-10"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PicturesOfThePlace;
