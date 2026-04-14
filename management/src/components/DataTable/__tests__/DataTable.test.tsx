/**
 * DataTable Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataTable, { Column } from '../DataTable';

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

const mockData: TestData[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'ACTIVE',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'ACTIVE',
    createdAt: '2024-01-16',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'INACTIVE',
    createdAt: '2024-01-17',
  },
];

const mockColumns: Column<TestData>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
];

describe('DataTable', () => {
  it('should render table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should render column headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<DataTable columns={mockColumns} data={[]} loading={true} />);

    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('should display error message', () => {
    const errorMessage = 'Failed to load data';
    render(<DataTable columns={mockColumns} data={[]} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display no data message when empty', () => {
    render(<DataTable columns={mockColumns} data={[]} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('should search data by term', async () => {
    render(<DataTable columns={mockColumns} data={mockData} searchable={true} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('should sort data by column', async () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // First row is header, second row should be Bob (ascending sort)
      expect(rows[1]).toHaveTextContent('Bob Johnson');
    });
  });

  it('should toggle sort direction', async () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByText('Name');

    // First click - ascending
    fireEvent.click(nameHeader);
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bob Johnson');
    });

    // Second click - descending
    fireEvent.click(nameHeader);
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('John Doe');
    });
  });

  it('should handle row click', () => {
    const handleRowClick = jest.fn();
    render(<DataTable columns={mockColumns} data={mockData} onRowClick={handleRowClick} />);

    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow!);

    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('should render custom column content', () => {
    const customColumns: Column<TestData>[] = [
      { key: 'id', label: 'ID' },
      {
        key: 'status',
        label: 'Status',
        render: (value) => <span className="badge">{value}</span>,
      },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);

    const badges = screen.getAllByText(/ACTIVE|INACTIVE/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should handle pagination', () => {
    const handlePageChange = jest.fn();
    const handleLimitChange = jest.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 10,
          total: 30,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
      />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 10,
          total: 30,
          onPageChange: jest.fn(),
          onLimitChange: jest.fn(),
        }}
      />
    );

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 3,
          limit: 10,
          total: 30,
          onPageChange: jest.fn(),
          onLimitChange: jest.fn(),
        }}
      />
    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should handle items per page change', () => {
    const handleLimitChange = jest.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 10,
          total: 30,
          onPageChange: jest.fn(),
          onLimitChange: handleLimitChange,
        }}
      />
    );

    const limitSelect = screen.getByDisplayValue('10 per page');
    fireEvent.change(limitSelect, { target: { value: '25' } });

    expect(handleLimitChange).toHaveBeenCalledWith(25);
  });

  it('should toggle column visibility', async () => {
    render(<DataTable columns={mockColumns} data={mockData} filterable={true} />);

    // Click column visibility button
    const columnButton = screen.getByTitle('Column visibility');
    fireEvent.click(columnButton);

    await waitFor(() => {
      const emailCheckbox = screen.getByRole('checkbox', { name: /Email/ });
      expect(emailCheckbox).toBeInTheDocument();
    });
  });

  it('should handle export', async () => {
    const handleExport = jest.fn();

    render(<DataTable columns={mockColumns} data={mockData} onExport={handleExport} />);

    // Click export button
    const exportButton = screen.getByTitle('Export data');
    fireEvent.click(exportButton);

    await waitFor(() => {
      const csvButton = screen.getByText('Export as CSV');
      fireEvent.click(csvButton);
      expect(handleExport).toHaveBeenCalledWith('csv');
    });
  });

  it('should display pagination info', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 10,
          total: 25,
          onPageChange: jest.fn(),
          onLimitChange: jest.fn(),
        }}
      />
    );

    expect(screen.getByText(/Showing 1 to 10 of 25 results/)).toBeInTheDocument();
  });

  it('should handle non-sortable columns', () => {
    const nonSortableColumns: Column<TestData>[] = [
      { key: 'id', label: 'ID', sortable: false },
      { key: 'name', label: 'Name', sortable: false },
    ];

    render(<DataTable columns={nonSortableColumns} data={mockData} />);

    const idHeader = screen.getByText('ID');
    fireEvent.click(idHeader);

    // Should not sort
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
