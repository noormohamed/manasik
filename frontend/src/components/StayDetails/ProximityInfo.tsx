"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface HaramGate {
  id: string;
  gateNumber: number;
  nameEnglish: string;
  nameArabic: string;
  distanceMeters: number;
  walkingTimeMinutes: number;
  isRecommended: boolean;
  hasDirectKaabaAccess: boolean;
  floorLevel: 'ground' | 'first' | 'roof';
  isClosestDirectAccess: boolean;
}

interface NearbyAttraction {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  category: string;
  distanceMeters: number;
  walkingTimeMinutes: number;
}

interface ProximityData {
  gates: HaramGate[];
  attractions: NearbyAttraction[];
  recommendedGate: HaramGate | null;
  closestDirectAccessGate: HaramGate | null;
}

interface ProximityInfoProps {
  hotelId: string;
}

const ProximityInfo: React.FC<ProximityInfoProps> = ({ hotelId }) => {
  const [data, setData] = useState<ProximityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllGates, setShowAllGates] = useState(false);

  useEffect(() => {
    fetchProximityData();
  }, [hotelId]);

  const fetchProximityData = async () => {
    try {
      const response = await apiClient.get(`/hotels/${hotelId}/proximity`) as ProximityData;
      setData(response);
    } catch (err: any) {
      console.error("Error fetching proximity data:", err);
      setError("Unable to load proximity information");
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'religious': return 'ri-building-4-line';
      case 'historical': return 'ri-ancient-gate-line';
      case 'shopping': return 'ri-shopping-bag-line';
      case 'transport': return 'ri-bus-line';
      case 'food': return 'ri-restaurant-line';
      case 'medical': return 'ri-hospital-line';
      default: return 'ri-map-pin-line';
    }
  };

  if (loading) {
    return (
      <div className="proximity-info mb-4">
        <div className="card">
          <div className="card-body text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0 text-muted small">Loading proximity info...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail if proximity data unavailable
  }

  const displayedGates = showAllGates ? data.gates : data.gates.slice(0, 4);
  const religiousAttractions = data.attractions.filter(a => a.category === 'religious').slice(0, 5);
  const otherAttractions = data.attractions.filter(a => a.category !== 'religious').slice(0, 3);

  return (
    <div className="proximity-info mb-4">
      {/* Recommended Gate - Highlighted */}
      {data.recommendedGate && (
        <div className="card mb-3 border-success">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="ri-door-open-line me-2"></i>
              Closest Haram Gate
            </h5>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1">Gate {data.recommendedGate.gateNumber} - {data.recommendedGate.nameEnglish}</h4>
                <div className="d-flex gap-2 mt-1">
                  {data.recommendedGate.hasDirectKaabaAccess && (
                    <span className="badge bg-warning text-dark">
                      <i className="ri-checkbox-circle-line me-1"></i>
                      Direct Kaaba Access
                    </span>
                  )}
                  <span className="badge bg-light text-dark">
                    {data.recommendedGate.floorLevel === 'ground' ? 'Ground Floor' : 
                     data.recommendedGate.floorLevel === 'first' ? 'First Floor' : 'Roof Level'}
                  </span>
                </div>
              </div>
              <div className="text-end">
                <div className="h4 text-success mb-0">{formatDistance(data.recommendedGate.distanceMeters)}</div>
                <small className="text-muted">~{data.recommendedGate.walkingTimeMinutes} min walk</small>
              </div>
            </div>
            <div className="alert alert-success mt-3 mb-0" style={{ fontSize: '13px' }}>
              <i className="ri-information-line me-2"></i>
              This is the closest gate to your hotel. We recommend using this entrance for the shortest walk to Masjid al-Haram.
            </div>
          </div>
        </div>
      )}

      {/* Closest Direct Kaaba Access Gate - if different from recommended */}
      {data.closestDirectAccessGate && data.recommendedGate && 
       data.closestDirectAccessGate.id !== data.recommendedGate.id && (
        <div className="card mb-3 border-warning">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <i className="ri-focus-3-line me-2"></i>
              Closest Direct Kaaba Access
            </h5>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1">Gate {data.closestDirectAccessGate.gateNumber} - {data.closestDirectAccessGate.nameEnglish}</h4>
                <span className="badge bg-light text-dark">Ground Floor - Direct to Mataf</span>
              </div>
              <div className="text-end">
                <div className="h4 text-warning mb-0">{formatDistance(data.closestDirectAccessGate.distanceMeters)}</div>
                <small className="text-muted">~{data.closestDirectAccessGate.walkingTimeMinutes} min walk</small>
              </div>
            </div>
            <div className="alert alert-warning mt-3 mb-0" style={{ fontSize: '13px' }}>
              <i className="ri-star-line me-2"></i>
              This gate provides direct ground-floor access to the Mataf (Tawaf area around the Kaaba). Ideal for Tawaf and prayers near the Kaaba.
            </div>
          </div>
        </div>
      )}

      {/* All Haram Gates */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="ri-door-line me-2"></i>
            All Haram Gates
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Gate</th>
                  <th>Name</th>
                  <th className="text-end">Distance</th>
                  <th className="text-end">Walk Time</th>
                </tr>
              </thead>
              <tbody>
                {displayedGates.map((gate) => (
                  <tr key={gate.id} className={gate.isRecommended ? 'table-success' : gate.isClosestDirectAccess ? 'table-warning' : ''}>
                    <td>
                      <span className="badge bg-secondary">#{gate.gateNumber}</span>
                    </td>
                    <td>
                      <div>{gate.nameEnglish}</div>
                      <div className="d-flex gap-1 mt-1">
                        {gate.hasDirectKaabaAccess && (
                          <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                            Direct Access
                          </span>
                        )}
                        <span className="badge bg-light text-muted" style={{ fontSize: '0.65rem' }}>
                          {gate.floorLevel === 'ground' ? 'Ground' : gate.floorLevel === 'first' ? '1st Floor' : 'Roof'}
                        </span>
                      </div>
                    </td>
                    <td className="text-end">
                      <strong>{formatDistance(gate.distanceMeters)}</strong>
                    </td>
                    <td className="text-end text-muted">
                      {gate.walkingTimeMinutes} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.gates.length > 4 && (
            <button 
              className="btn btn-link btn-sm p-0 mt-2"
              onClick={() => setShowAllGates(!showAllGates)}
            >
              {showAllGates ? 'Show less' : `Show all ${data.gates.length} gates`}
            </button>
          )}
        </div>
      </div>

      {/* Nearby Attractions */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="ri-map-pin-line me-2"></i>
            Nearby Attractions
          </h5>
        </div>
        <div className="card-body">
          {/* Religious Sites */}
          {religiousAttractions.length > 0 && (
            <>
              <h6 className="text-muted mb-2">
                <i className="ri-building-4-line me-1"></i> Religious Sites
              </h6>
              <ul className="list-unstyled mb-3">
                {religiousAttractions.map((attraction) => (
                  <li key={attraction.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <span>{attraction.nameEnglish}</span>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-light text-dark">{formatDistance(attraction.distanceMeters)}</span>
                      <small className="text-muted d-block">{attraction.walkingTimeMinutes} min</small>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Other Attractions */}
          {otherAttractions.length > 0 && (
            <>
              <h6 className="text-muted mb-2">
                <i className="ri-store-line me-1"></i> Other Nearby
              </h6>
              <ul className="list-unstyled mb-0">
                {otherAttractions.map((attraction) => (
                  <li key={attraction.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <i className={`${getCategoryIcon(attraction.category)} me-2 text-muted`}></i>
                      <span>{attraction.nameEnglish}</span>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-light text-dark">{formatDistance(attraction.distanceMeters)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProximityInfo;
