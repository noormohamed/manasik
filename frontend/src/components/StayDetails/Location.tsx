"use client";

interface LocationProps {
  latitude: number;
  longitude: number;
  address: string;
}

const Location: React.FC<LocationProps> = ({ latitude, longitude, address }) => {
  return (
    <div className="stay-location box-style mb-4">
      <div className="box-title">
        <h4>Location</h4>
        <p>{address}</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="ri-map-pin-line me-2" style={{ fontSize: '20px', color: '#10B981' }}></i>
            <span>{address}</span>
          </div>
          
          {latitude && longitude && (
            <div className="text-muted small">
              <i className="ri-navigation-line me-2"></i>
              Coordinates: {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
            </div>
          )}

          <div className="alert alert-info mt-3">
            <i className="ri-information-line me-2"></i>
            Interactive map coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
