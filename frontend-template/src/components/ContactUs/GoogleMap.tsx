"use client";

const GoogleMap = () => {
  return (
    <>
      <div className="ptb-175">
        <div className="container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d206253.56867320824!2d-115.4868161862367!3d36.12487333558106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80beb782a4f57dd1%3A0x3accd5e6d5b379a3!2sLas%20Vegas%2C%20NV%2C%20USA!5e0!3m2!1sen!2sbd!4v1694489664495!5m2!1sen!2sbd" 
            width="100%" 
            height="400" 
            style={{ border: '0', borderRadius: '20px' }} 
            allowFullScreen
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default GoogleMap;
