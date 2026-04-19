'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Booking } from '@/components/MyBookings/types';
import { getDisplayStatus } from '@/components/MyBookings/utils';
import QRCode from 'qrcode';
import styles from './confirmation.module.css';

// Helper function to mask passport number - always show ******* + last 4 chars
const maskPassportNumber = (passportNumber: string): string => {
  if (!passportNumber || passportNumber.length <= 4) {
    return passportNumber;
  }
  const lastFour = passportNumber.slice(-4);
  return '********' + lastFour;
};

const BookingConfirmationPage: React.FC = () => {
  const params = useParams();
  const bookingId = params.id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [closestGateQrUrl, setClosestGateQrUrl] = useState<string | null>(null);
  const [kaabaGateQrUrl, setKaabaGateQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBooking();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError('Please sign in to view booking confirmation');
    }
  }, [authLoading, isAuthenticated, bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from the list endpoint to get guestDetails
      const response = (await apiClient.get(`/users/me/bookings`)) as any;
      const bookings = response.bookings || [];
      const b = bookings.find((booking: any) => booking.id === bookingId);
      
      if (!b) {
        setError('Booking not found');
        setLoading(false);
        return;
      }

      console.log('Booking data:', b); // Debug log

      // Extract hotel name from various possible locations
      let hotelName = b.hotelName || b.metadata?.hotelName || b.hotel?.name || 'Unknown Hotel';

      const fetchedBooking: Booking = {
        id: b.id,
        status: b.status,
        currency: b.currency,
        subtotal: b.subtotal,
        tax: b.tax,
        total: b.total,
        refundAmount: b.refundAmount || null,
        refundReason: b.refundReason || null,
        refundedAt: b.refundedAt || null,
        paymentStatus: b.paymentStatus,
        bookingSource: b.bookingSource || 'DIRECT',
        hotelId: b.metadata?.hotelId || b.hotelId || b.hotel?.id || '',
        hotelName: hotelName,
        hotelAddress: b.hotelAddress || b.metadata?.hotelAddress || b.hotel?.address || '',
        hotelCity: b.hotelCity || b.metadata?.hotelCity || b.hotel?.city || '',
        hotelCountry: b.hotelCountry || b.metadata?.hotelCountry || b.hotel?.country || '',
        hotelFullAddress: b.hotelFullAddress || b.metadata?.hotelFullAddress || b.hotel?.fullAddress || '',
        hotelImage: b.hotelImage || b.metadata?.hotelImage || b.hotel?.image || null,
        hotelPhone: b.hotelPhone || b.metadata?.hotelPhone || b.hotel?.phone || '',
        starRating: b.starRating || b.hotel?.starRating,
        closestGate: b.closestGate || null,
        kaabaGate: b.kaabaGate || null,
        roomTypeId: b.metadata?.roomTypeId || b.roomTypeId || '',
        roomName: b.roomType || b.metadata?.roomType || 'Room',
        checkIn: b.checkInDate || b.metadata?.checkInDate || '',
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || '',
        checkInTime: b.checkInTime || '14:00',
        checkOutTime: b.checkOutTime || '11:00',
        nights: b.nights || b.metadata?.nights || 1,
        guestName: b.metadata?.guestName || b.guestName || '',
        guestEmail: b.metadata?.guestEmail || b.guestEmail || '',
        guestPhone: b.metadata?.guestPhone || b.guestPhone || '',
        guestCount: b.guests || b.metadata?.guests || 1,
        guests: b.guestDetails && Array.isArray(b.guestDetails) ? b.guestDetails : [],
        customerId: b.customerId,
        agentId: b.agentId,
        agentName: b.agentName,
        agentEmail: b.agentEmail,
        providerName: b.providerName,
        providerReference: b.providerReference,
        providerPhone: b.providerPhone,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };

      setBooking(fetchedBooking);
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      setError(err.error || 'Failed to fetch booking confirmation');
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code when booking data is available
  useEffect(() => {
    if (booking && booking.hotelFullAddress) {
      // Create Google Maps directions URL that immediately provides directions
      // Using the directions endpoint with destination parameter
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.hotelFullAddress)}&travelmode=walking`;
      
      // Generate QR code for hotel
      QRCode.toDataURL(mapsUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 200,
        margin: 1,
      })
        .then((url: string) => {
          setQrCodeUrl(url);
        })
        .catch((err: any) => {
          console.error('Error generating QR code:', err);
        });

      // Generate QR code for closest gate if available
      if (booking.closestGate) {
        const gateLocation = `Gate ${booking.closestGate.gateNumber}, ${booking.closestGate.name}`;
        const gateUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(gateLocation)}&travelmode=walking`;
        
        QRCode.toDataURL(gateUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 200,
          margin: 1,
        })
          .then((url: string) => {
            setClosestGateQrUrl(url);
          })
          .catch((err: any) => {
            console.error('Error generating closest gate QR code:', err);
          });
      }

      // Generate QR code for Kaaba gate if available
      if (booking.kaabaGate) {
        const gateLocation = `Gate ${booking.kaabaGate.gateNumber}, ${booking.kaabaGate.name}`;
        const gateUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(gateLocation)}&travelmode=walking`;
        
        QRCode.toDataURL(gateUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 200,
          margin: 1,
        })
          .then((url: string) => {
            setKaabaGateQrUrl(url);
          })
          .catch((err: any) => {
            console.error('Error generating Kaaba gate QR code:', err);
          });
      }
    }
  }, [booking]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('confirmation-content');
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(element.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading booking confirmation...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error || 'Booking not found'}</p>
          <a href="/my-bookings" className={styles.backLink}>
            Back to My Bookings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Booking Confirmation</h1>
          <p className={styles.bookingId}>Booking ID: {booking.id}</p>
        </div>
        <div className={styles.actions}>
          <button onClick={handlePrint} className={styles.button}>
            <i className="ri-printer-line"></i> Print
          </button>
          <a href="/my-bookings" className={styles.button}>
            <i className="ri-arrow-left-line"></i> Back
          </a>
        </div>
      </div>

      <div id="confirmation-content" className={styles.content}>
        {/* QR Code and Hotel Info Section */}
        <section className={styles.section}>
          <div className={styles.hotelInfoWithQR}>
            {/* Left Column - Hotel Info */}
            <div className={styles.hotelInfoColumn}>
              <div className={styles.hotelName}>{booking.hotelName}</div>
              <div className={styles.bookingDate}>
                {new Date(booking.createdAt).toLocaleDateString()}
              </div>
              <div className={styles.address}>
                {booking.hotelFullAddress || booking.hotelAddress}
              </div>

              <h3 className={styles.title}>Accommodation</h3>

              <div className={styles.times}>
                <div className={styles.timeItem}>
                  <span className={styles.roomLabel}>Room</span>
                  <span className={styles.roomValue}>{booking.roomName}</span>
                </div>
                <div className={styles.timeItem}>
                  <span className={styles.roomLabel}>Check-in</span>
                  <span className={styles.roomValue}>
                    {new Date(booking.checkIn).toLocaleDateString()} @ {booking.checkInTime || '14:00'}
                  </span>
                </div>
                <div className={styles.timeItem}>
                  <span className={styles.roomLabel}>Check-out</span>
                  <span className={styles.roomValue}>
                    {new Date(booking.checkOut).toLocaleDateString()} @ {booking.checkOutTime || '11:00'}
                  </span>
                </div>
                <div className={styles.timeItem}>
                  <span className={styles.roomLabel}>Duration</span>
                  <span className={styles.roomValue}>
                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                  </span>
                </div>
                <div className={styles.timeItem}>
                  <span className={styles.roomLabel}>Status</span>
                  <span className={`${styles.roomValue} ${styles.status}`}>{getDisplayStatus(booking)}</span>
                </div>
              </div>

              {booking.hotelPhone && (
                <div className={styles.detailsBox}>
                  <p className={styles.detailItem}>
                    <strong>Hotel Phone:</strong> {booking.hotelPhone}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - QR Code */}
            {qrCodeUrl && (
              <div className={styles.qrCodeColumn}>
                <div className={styles.qrCodeContainer}>
                  <h4 className={styles.qrCodeTitle}>Scan for Directions</h4>
                  <img 
                    src={qrCodeUrl} 
                    alt="Scan for hotel directions" 
                    className={styles.qrCodeImage}
                  />
                  <p className={styles.qrCodeSubtitle}>Scan with your phone</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Haram Gate Access */}
        {(booking.closestGate || booking.kaabaGate) && (
          <section className={styles.section}>
            <h3 className={styles.title}>Haram Gate Access</h3>
            <div className={styles.gateColumn}>
              {booking.closestGate ? (
                <div className={`${styles.gateBox} ${styles.closestGate}`}>
                  <div className={styles.gateBoxContent}>
                    <div className={styles.gateInfo}>
                      <h4 className={styles.gateTitle}>Closest Haram Gate</h4>
                      <p className={styles.gateName}>
                        Gate {booking.closestGate.gateNumber} - {booking.closestGate.name}
                      </p>
                      <div className={styles.gateDetails}>
                        <span>{booking.closestGate.distance}m</span>
                        <span>•</span>
                        <span>{booking.closestGate.walkingTime} min walk</span>
                      </div>
                    </div>
                    {closestGateQrUrl && (
                      <div className={styles.gateQrCode}>
                        <img 
                          src={closestGateQrUrl} 
                          alt="Scan for directions to closest gate" 
                          className={styles.gateQrImage}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`${styles.gateBox} ${styles.closestGate}`}>
                  <h4 className={styles.gateTitle}>Closest Haram Gate</h4>
                  <p className={styles.notAvailable}>Not available</p>
                </div>
              )}

              {booking.kaabaGate ? (
                <div className={`${styles.gateBox} ${styles.kaabaGate}`}>
                  <div className={styles.gateBoxContent}>
                    <div className={styles.gateInfo}>
                      <h4 className={styles.gateTitle}>Kaaba Gate Access</h4>
                      <p className={styles.gateName}>
                        Gate {booking.kaabaGate.gateNumber} - {booking.kaabaGate.name}
                      </p>
                      <div className={styles.gateDetails}>
                        <span>{booking.kaabaGate.distance}m</span>
                        <span>•</span>
                        <span>{booking.kaabaGate.walkingTime} min walk</span>
                      </div>
                    </div>
                    {kaabaGateQrUrl && (
                      <div className={styles.gateQrCode}>
                        <img 
                          src={kaabaGateQrUrl} 
                          alt="Scan for directions to Kaaba gate" 
                          className={styles.gateQrImage}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`${styles.gateBox} ${styles.kaabaGate}`}>
                  <h4 className={styles.gateTitle}>Kaaba Gate Access</h4>
                  <p className={styles.notAvailable}>Not available</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Guest Information */}
        <section className={styles.section}>
          <h3 className={styles.title}>Guest Information</h3>
          <div className={styles.guestInfo}>
            {booking.guests && booking.guests.length > 0 ? (
              booking.guests.map((guest: any) => (
                <div key={guest.id} className={styles.guestCard}>
                  <div className={styles.guestHeader}>
                    <span className={styles.guestName}>
                      {guest.firstName} {guest.lastName}
                      {guest.isLeadPassenger && (
                        <span className={styles.leadBadge}>LEAD</span>
                      )}
                    </span>
                  </div>
                  <div className={styles.guestDetails}>
                    {guest.email && (
                      <div className={styles.guestRow}>
                        <span className={styles.guestLabel}>
                          <i className="ri-mail-line"></i> Email
                        </span>
                        <span className={styles.guestValue}>{guest.email}</span>
                      </div>
                    )}
                    {guest.phone && (
                      <div className={styles.guestRow}>
                        <span className={styles.guestLabel}>
                          <i className="ri-phone-line"></i> Phone
                        </span>
                        <span className={styles.guestValue}>{guest.phone}</span>
                      </div>
                    )}
                    {guest.nationality && (
                      <div className={styles.guestRow}>
                        <span className={styles.guestLabel}>
                          <i className="ri-earth-line"></i> Nationality
                        </span>
                        <span className={styles.guestValue}>{guest.nationality}</span>
                      </div>
                    )}
                    {guest.passportNumber && (
                      <div className={styles.guestRow}>
                        <span className={styles.guestLabel}>
                          <i className="ri-passport-line"></i> Passport
                        </span>
                        <span className={styles.guestValue}>{maskPassportNumber(guest.passportNumber)}</span>
                      </div>
                    )}
                    {guest.dateOfBirth && (
                      <div className={styles.guestRow}>
                        <span className={styles.guestLabel}>
                          <i className="ri-calendar-line"></i> Date of Birth
                        </span>
                        <span className={styles.guestValue}>
                          {new Date(guest.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.guestCard}>
                <div className={styles.guestHeader}>
                  <span className={styles.guestName}>
                    {booking.guestName || 'Guest'}
                  </span>
                </div>
                <div className={styles.guestDetails}>
                  {booking.guestEmail && (
                    <div className={styles.guestRow}>
                      <span className={styles.guestLabel}>
                        <i className="ri-mail-line"></i> Email
                      </span>
                      <span className={styles.guestValue}>{booking.guestEmail}</span>
                    </div>
                  )}
                  {booking.guestPhone && (
                    <div className={styles.guestRow}>
                      <span className={styles.guestLabel}>
                        <i className="ri-phone-line"></i> Phone
                      </span>
                      <span className={styles.guestValue}>{booking.guestPhone}</span>
                    </div>
                  )}
                  {booking.guestCount && (
                    <div className={styles.guestRow}>
                      <span className={styles.guestLabel}>
                        <i className="ri-group-line"></i> Guests
                      </span>
                      <span className={styles.guestValue}>{booking.guestCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Payment Summary */}
        <section className={styles.section}>
          <h3 className={styles.title}>Payment Summary</h3>
          <div className={styles.paymentSummary}>
            <div className={styles.paymentRow}>
              <span>Subtotal</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: booking.currency || 'USD',
                }).format(booking.subtotal)}
              </span>
            </div>
            {booking.refundAmount && booking.refundAmount > 0 && (
              <div className={styles.paymentRow}>
                <span>{booking.refundAmount >= booking.total ? 'Full Refund' : 'Partial Refund'}</span>
                <span style={{ color: '#dc3545' }}>
                  -
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: booking.currency || 'USD',
                  }).format(booking.refundAmount)}
                </span>
              </div>
            )}
            <div className={styles.paymentRow}>
              <span>Tax</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: booking.currency || 'USD',
                }).format(
                  booking.tax -
                    (booking.refundAmount && booking.total > 0
                      ? (booking.refundAmount / booking.total) * booking.tax
                      : 0)
                )}
              </span>
            </div>
            <div className={`${styles.paymentRow} ${styles.total}`}>
              <span>Total</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: booking.currency || 'USD',
                }).format(booking.total - (booking.refundAmount || 0))}
              </span>
            </div>
            {booking.refundAmount && booking.refundAmount > 0 && (
              <div className={styles.refundInfo}>
                {booking.refundReason && (
                  <p>
                    <strong>Refund Reason:</strong> {booking.refundReason}
                  </p>
                )}
                {booking.refundedAt && (
                  <p>
                    <strong>Refunded on:</strong> {new Date(booking.refundedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <p>This is your booking confirmation. Please keep it for your records.</p>
        <p className={styles.printDate}>Generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
