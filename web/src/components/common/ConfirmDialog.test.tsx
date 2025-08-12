import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    message: 'Are you sure?',
    onConfirm: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog 
        {...defaultProps}
        isOpen={false}
      />
    );

    // When dialog is closed, nothing should be rendered
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('displays the default title when no title is provided', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('displays the custom title when provided', () => {
    render(
      <ConfirmDialog 
        {...defaultProps}
        title="Delete Item" 
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('applies the correct CSS classes', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />);

    // Verify the dialog elements are present with correct structure
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('confirm-dialog-overlay');
    
    // Check for the dialog content container
    expect(screen.getByRole('heading', { name: /confirm action/i })).toBeInTheDocument();
    
    // Check button classes
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('confirm-dialog-button');
    expect(confirmButton).toHaveClass('confirm');
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toHaveClass('confirm-dialog-button');
    expect(cancelButton).toHaveClass('cancel');
  });
});