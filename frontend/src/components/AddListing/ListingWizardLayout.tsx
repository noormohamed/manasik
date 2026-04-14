"use client";

import React, { ReactNode } from 'react';
import { ListingProvider } from '@/context/ListingContext';
import ListingPreview from './ListingPreview';

interface ListingWizardLayoutProps {
  children: ReactNode;
}

const ListingWizardLayout = ({ children }: ListingWizardLayoutProps) => {
  return (
    <ListingProvider>
      <style jsx global>{`
        .listing-wizard-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          min-height: calc(100vh - 200px);
          max-width: 1600px;
          margin: 0 auto;
          padding: 30px;
        }
        
        @media (max-width: 1200px) {
          .listing-wizard-container {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .listing-wizard-preview {
            order: -1;
            max-height: 400px;
          }
        }
        
        @media (max-width: 768px) {
          .listing-wizard-container {
            padding: 15px;
          }
        }

        .listing-wizard-form {
          padding-right: 30px;
        }
        
        @media (max-width: 1200px) {
          .listing-wizard-form {
            padding-right: 0;
          }
        }

        .listing-wizard-preview {
          position: sticky;
          top: 100px;
          height: fit-content;
          max-height: calc(100vh - 150px);
        }

        /* Override the default choosing-listing-categories-area styles */
        .listing-wizard-form .choosing-listing-categories-area {
          padding: 0 !important;
        }
        
        .listing-wizard-form .choosing-listing-categories-content {
          max-width: 100% !important;
        }
      `}</style>

      <div className="listing-wizard-container">
        <div className="listing-wizard-form">
          {children}
        </div>
        <div className="listing-wizard-preview">
          <ListingPreview />
        </div>
      </div>
    </ListingProvider>
  );
};

export default ListingWizardLayout;
