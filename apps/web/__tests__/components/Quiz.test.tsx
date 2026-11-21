import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Quiz } from '../../components/Quiz';

describe('Interactive Quiz Component', () => {
  it('renders question 1 and choices', () => {
    render(<Quiz />);

    expect(screen.getByText(/Spot the Scam Quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 10/i)).toBeInTheDocument();
    expect(screen.getByText(/It's a SCAM/i)).toBeInTheDocument();
    expect(screen.getByText(/It's LEGITIMATE/i)).toBeInTheDocument();
  });

  it('shows immediate feedback when answering question 1', () => {
    render(<Quiz />);

    // Click "It's a SCAM" on Q1 (Fake SBI KYC)
    const scamBtn = screen.getByText(/It's a SCAM/i);
    fireEvent.click(scamBtn);

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Question/i)).toBeInTheDocument();
  });
});
