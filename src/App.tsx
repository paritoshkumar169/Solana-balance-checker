import { useState, FormEvent } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import styled from '@emotion/styled';

// Solana-inspired colors
const colors = {
  purple: '#9945FF',
  green: '#14F195',
  background: '#1A1A1A',
  text: '#FFFFFF',
  error: '#FF4567',
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${colors.background};
  color: ${colors.text};
  padding: 2rem;
`;

const Title = styled.h1`
  color: ${colors.purple};
  font-size: 2.5rem;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid ${colors.purple};
  border-radius: 8px;
  background: transparent;
  color: ${colors.text};
  font-size: 1rem;
  width: 300px;

  &:focus {
    outline: none;
    border-color: ${colors.green};
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background: ${colors.purple};
  border: none;
  border-radius: 8px;
  color: ${colors.background};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: ${colors.green};
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const BalanceDisplay = styled.div`
  background: rgba(153, 69, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${colors.purple};
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  margin-bottom: 1rem;
`;

export default function App() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBalance(null);

    try {
      // Validate address
      if (!address.trim()) throw new Error('Address cannot be empty');
      const publicKey = new PublicKey(address.trim());

      // Connect to Solana Mainnet
      const connection = new Connection(clusterApiUrl('mainnet-beta'));

      // Fetch balance
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / 1e9); // Convert lamports to SOL
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Solana Wallet Balance Checker</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Solana wallet address"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Check Balance'}
        </Button>
      </Form>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {balance !== null && (
        <BalanceDisplay>
          <h2>Wallet Balance</h2>
          <p>{balance} SOL</p>
        </BalanceDisplay>
      )}
    </Container>
  );
}