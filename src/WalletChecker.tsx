import { useState, FormEvent } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  name?: string;
  symbol?: string;
}

export default function WalletChecker() {
  const [address, setAddress] = useState<string>('');
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSolBalance(null);
    setTokenBalances([]);

    try {
      // Validate address
      if (!address.trim()) throw new Error('Address cannot be empty');
      const publicKey = new PublicKey(address.trim());

      // Connect to Mainnet
      const connection = new Connection('API KEY ENDPOINT');
      // Fetch SOL balance
      const lamports = await connection.getBalance(publicKey);
      setSolBalance(lamports / 1e9);

      // Fetch token balances
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      // Decode token accounts
      const balances: TokenBalance[] = [];
      for (const account of tokenAccounts.value) {
        const accountInfo = await connection.getParsedAccountInfo(account.pubkey);
        const data = accountInfo.value?.data;
        
        if (data && 'parsed' in data) {
          balances.push({
            mint: data.parsed.info.mint,
            amount: data.parsed.info.tokenAmount.uiAmount,
            decimals: data.parsed.info.tokenAmount.decimals,
          });
        }
      }

      // Fetch token metadata (name, symbol)
      await Promise.all(balances.map(async (balance) => {
        try {
          const metadata = await fetchTokenMetadata(balance.mint);
          balance.name = metadata.name;
          balance.symbol = metadata.symbol;
        } catch {
          // Skip if metadata fetch fails
        }
      }));

      setTokenBalances(balances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch token metadata from Solana Token Registry
  const fetchTokenMetadata = async (mintAddress: string) => {
    const response = await fetch(
      `https://api.solscan.io/token/meta?token=${mintAddress}`
    );
    const data = await response.json();
    return {
      name: data.data.tokenName,
      symbol: data.data.tokenSymbol,
    };
  };

  return (
    <div className="wallet-checker">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Solana wallet address"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Check Balances'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {solBalance !== null && (
        <div className="balance">
          <h3>SOL Balance:</h3>
          <p>{solBalance} SOL</p>
        </div>
      )}

      {tokenBalances.length > 0 && (
        <div className="token-balances">
          <h3>Token Balances:</h3>
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Balance</th>
                <th>Mint Address</th>
              </tr>
            </thead>
            <tbody>
              {tokenBalances.map((token, index) => (
                <tr key={index}>
                  <td>
                    {token.name || 'Unknown'} ({token.symbol || 'UNKNOWN'})
                  </td>
                  <td>{token.amount}</td>
                  <td className="mint-address">{token.mint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}