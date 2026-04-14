import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedFilters, { AdvancedFilterParams } from '../AdvancedFilters';

describe('AdvancedFilters', () => {
  const mockOnFilterChange = jest.fn();
  
  const defaultFilters: AdvancedFilterParams = {
    facilities: [],
    roomFacilities: [],
    proximityLandmark: undefined,
    proximityDistance: undefined,
    surroundings: [],
    airportMaxDistance: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hotel Facilities Section', () => {
    it('should render hotel facilities section', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('Hotel Facilities')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Badge showing count
    });

    it('should expand hotel facilities when clicked', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      const header = screen.getByText('Hotel Facilities');
      fireEvent.click(header);
      
      expect(screen.getByLabelText('WiFi')).toBeInTheDocument();
      expect(screen.getByLabelText('Parking')).toBeInTheDocument();
      expect(screen.getByLabelText('Gym')).toBeInTheDocument();
    });

    it('should select a facility when checkbox is clicked', async () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      // Expand section
      fireEvent.click(screen.getByText('Hotel Facilities'));
      
      // Click WiFi checkbox
      const wifiCheckbox = screen.getByLabelText('WiFi') as HTMLInputElement;
      fireEvent.click(wifiCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...defaultFilters,
          facilities: ['WiFi'],
        });
      });
    });

    it('should allow multiple facility selections', async () => {
      const filters = { ...defaultFilters, facilities: ['WiFi'] };
      const { rerender } = render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Hotel Facilities'));
      
      // Select Parking
      const parkingCheckbox = screen.getByLabelText('Parking');
      fireEvent.click(parkingCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...filters,
          facilities: ['WiFi', 'Parking'],
        });
      });
    });

    it('should deselect a facility when clicked again', async () => {
      const filters = { ...defaultFilters, facilities: ['WiFi', 'Parking'] };
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Hotel Facilities'));
      
      // Deselect WiFi
      const wifiCheckbox = screen.getByLabelText('WiFi');
      fireEvent.click(wifiCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...filters,
          facilities: ['Parking'],
        });
      });
    });

    it('should display correct badge count for selected facilities', () => {
      const filters = { ...defaultFilters, facilities: ['WiFi', 'Parking', 'Gym'] };
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Room Facilities Section', () => {
    it('should render room facilities section', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('Room Facilities')).toBeInTheDocument();
    });

    it('should expand room facilities when clicked', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      const header = screen.getByText('Room Facilities');
      fireEvent.click(header);
      
      expect(screen.getByLabelText('Air Conditioning')).toBeInTheDocument();
      expect(screen.getByLabelText('Television')).toBeInTheDocument();
      expect(screen.getByLabelText('Minibar')).toBeInTheDocument();
    });

    it('should select a room facility when checkbox is clicked', async () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Room Facilities'));
      
      const acCheckbox = screen.getByLabelText('Air Conditioning');
      fireEvent.click(acCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...defaultFilters,
          roomFacilities: ['Air Conditioning'],
        });
      });
    });

    it('should display correct badge count for selected room facilities', () => {
      const filters = { ...defaultFilters, roomFacilities: ['Air Conditioning', 'Television'] };
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Proximity to Landmarks Section', () => {
    it('should render proximity section', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('Proximity to Landmarks')).toBeInTheDocument();
    });

    it('should expand proximity section when clicked', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Proximity to Landmarks'));
      
      expect(screen.getByPlaceholderText('e.g., Airport, Train Station')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Distance in km')).toBeInTheDocument();
    });

    it('should update landmark input', async () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Proximity to Landmarks'));
      
      const landmarkInput = screen.getByPlaceholderText('e.g., Airport, Train Station') as HTMLInputElement;
      fireEvent.change(landmarkInput, { target: { value: 'Airport' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...defaultFilters,
          proximityLandmark: 'Airport',
          proximityDistance: undefined,
        });
      });
    });

    it('should update distance input', async () => {
      const filters = { ...defaultFilters, proximityLandmark: 'Airport' };
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Proximity to Landmarks'));
      
      const distanceInput = screen.getByPlaceholderText('Distance in km') as HTMLInputElement;
      fireEvent.change(distanceInput, { target: { value: '15' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...filters,
          proximityLandmark: 'Airport',
          proximityDistance: 15,
        });
      });
    });

    it('should show Active badge when proximity filter is set', () => {
      const filters = { ...defaultFilters, proximityLandmark: 'Airport', proximityDistance: 10 };
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Hotel Surroundings Section', () => {
    it('should render surroundings section', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('Hotel Surroundings')).toBeInTheDocument();
    });

    it('should expand surroundings section when clicked', () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Hotel Surroundings'));
      
      expect(screen.getByText('Nearby Attractions & Services')).toBeInTheDocument();
      expect(screen.getByLabelText('Restaurants & Cafes')).toBeInTheDocument();
      expect(screen.getByLabelText('Public Transport')).toBeInTheDocument();
    });

    it('should select a surrounding when checkbox is clicked', async () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Hotel Surroundings'));
      
      const restaurantsCheckbox = screen.getByLabelText('Restaurants & Cafes');
      fireEvent.click(restaurantsCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...defaultFilters,
          surroundings: ['restaurants'],
        });
      });
    });

    it('should update airport distance', async () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Hotel Surroundings'));
      
      const airportInput = screen.getByLabelText('Max Distance to Airport (km)') as HTMLInputElement;
      fireEvent.change(airportInput, { target: { value: '20' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...defaultFilters,
          airportMaxDistance: 20,
        });
      });
    });

    it('should display correct badge count for selected surroundings', () => {
      const filters = { ...defaultFilters, surroundings: ['restaurants', 'transport'] };
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Multiple Filter Interactions', () => {
    it('should handle multiple filter types simultaneously', async () => {
      const filters: AdvancedFilterParams = {
        facilities: ['WiFi', 'Parking'],
        roomFacilities: ['Air Conditioning'],
        proximityLandmark: 'Airport',
        proximityDistance: 15,
        surroundings: ['restaurants', 'transport'],
        airportMaxDistance: 20,
      };
      
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      // Expand and verify all sections show correct selections
      fireEvent.click(screen.getByText('Hotel Facilities'));
      expect(screen.getByLabelText('WiFi')).toBeChecked();
      expect(screen.getByLabelText('Parking')).toBeChecked();
      
      fireEvent.click(screen.getByText('Room Facilities'));
      expect(screen.getByLabelText('Air Conditioning')).toBeChecked();
      
      fireEvent.click(screen.getByText('Proximity to Landmarks'));
      expect((screen.getByPlaceholderText('e.g., Airport, Train Station') as HTMLInputElement).value).toBe('Airport');
      
      fireEvent.click(screen.getByText('Hotel Surroundings'));
      expect(screen.getByLabelText('Restaurants & Cafes')).toBeChecked();
      expect(screen.getByLabelText('Public Transport')).toBeChecked();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined filters gracefully', () => {
      render(<AdvancedFilters filters={{}} onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText('Hotel Facilities')).toBeInTheDocument();
      expect(screen.getByText('Room Facilities')).toBeInTheDocument();
    });

    it('should clear facility when last one is deselected', async () => {
      const filters = { ...defaultFilters, facilities: ['WiFi'] };
      render(<AdvancedFilters filters={filters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Hotel Facilities'));
      
      const wifiCheckbox = screen.getByLabelText('WiFi');
      fireEvent.click(wifiCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...filters,
          facilities: undefined,
        });
      });
    });

    it('should handle zero distance input', async () => {
      render(<AdvancedFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
      
      fireEvent.click(screen.getByText('Proximity to Landmarks'));
      
      const distanceInput = screen.getByPlaceholderText('Distance in km') as HTMLInputElement;
      fireEvent.change(distanceInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          ...defaultFilters,
          proximityLandmark: undefined,
          proximityDistance: undefined,
        });
      });
    });
  });
});
