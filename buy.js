import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "https://esm.sh/@solana/spl-token@0.3.5";

const masqMintAddress = '68o1DHL3XoEESBmMU1a1qQwe5BMAV2HFVPCCb5qmpump';
const treasuryPublicKey = new solanaWeb3.PublicKey('GANrTbdEBQqMGdNRen1XQAC2CZtzZwhovc68KH8Bzaga');

let provider = null;
let userPublicKey = null;
let heliusUrl = "";

function showLoadingSpinner(show = true) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = show ? 'block' : 'none';
}

async function getHeliusUrl() {
  try {
    showLoadingSpinner(true);
    const response = await fetch('/api/helius-key');
    if (!response.ok) throw new Error('Failed to fetch Helius key.');
    const { heliusKey } = await response.json();
    heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
    showLoadingSpinner(false);
  } catch (err) {
    console.error("Error fetching Helius key:", err);
    alert("Could not initialize wallet connection. Please try again later.");
  }
}

// Call this once at startup
await getHeliusUrl();

document.getElementById('connectWalletBtn').onclick = async () => {
  showLoadingSpinner(true);
  console.log("Connecting to Phantom...");
  if ('solana' in window) {
    provider = window.solana;
    try {
      const resp = await provider.connect();
      userPublicKey = resp.publicKey;
      document.getElementById('status').textContent = `Connected Wallet: ${userPublicKey.toBase58()}`;

      const connection = new solanaWeb3.Connection(heliusUrl);
      const masqMint = new solanaWeb3.PublicKey(masqMintAddress);

      const tokenAccounts = await connection.getTokenAccountsByOwner(
        userPublicKey,
        { mint: masqMint }
      );

      let balance = 0;
      if (tokenAccounts.value.length > 0) {
        const tokenAccountPubkey = tokenAccounts.value[0].pubkey;
        const tokenAccountInfo = await connection.getParsedAccountInfo(tokenAccountPubkey);
        balance = tokenAccountInfo.value.data.parsed.info.tokenAmount.uiAmount;
      }

      document.getElementById('balance').textContent = `$MASQ Balance: ${balance}`;
      if (balance >= 1_000) {
        document.getElementById('buyPackBtn').style.display = 'inline-block';
      }

      // Fetch user info from Supabase
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const supabase = createClient(
        "https://pklmlttcycefshwxqcwu.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbG1sdHRjeWNlZnNod3hxY3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDE0OTQsImV4cCI6MjA1ODY3NzQ5NH0.1NxMlj8YvWHpntGXRlXjB4ntxW5aO-uJH8USLvlGm4Y"
      );

      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) {
        document.getElementById('ownedSets').textContent = 'Sets owned: Guest mode';
        return;
      }

      const userId = user.user.id;
      const { data: profile } = await supabase.from('users').select('username, owned_sets, wallet').eq('id', userId).single();
      const ownedSets = profile?.owned_sets || [];
      const username = profile?.username || 'Not set';
      const linkedWallet = profile?.wallet || 'None linked';

      const setNames = ownedSets.map(setId => {
        if (setId === 1) return "Default Set";
        if (setId === 2) return "Golden Set";
        return `Set #${setId}`;
      });
      document.getElementById('ownedSets').textContent = `Sets owned: ${setNames.join(', ') || 'None'}`;
      document.getElementById('userInfo').innerHTML = `
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Linked Wallet:</strong> ${linkedWallet}</p>
      `;
      showLoadingSpinner(false);
    } catch (err) {
      console.error("Error connecting to wallet:", err);
      alert('Failed to connect wallet.');
    }
  } else {
    alert('Phantom wallet not found. Please install it.');
  }
};

document.getElementById('buyPackBtn').onclick = async () => {
  showLoadingSpinner(true);
  if (!provider || !userPublicKey) {
    alert('Please connect your wallet first!');
    return;
  }

  const connection = new solanaWeb3.Connection(heliusUrl);
  const masqMint = new solanaWeb3.PublicKey(masqMintAddress);

  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
  const supabase = createClient(
    "https://pklmlttcycefshwxqcwu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbG1sdHRjeWNlZnNod3hxY3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDE0OTQsImV4cCI6MjA1ODY3NzQ5NH0.1NxMlj8YvWHpntGXRlXjB4ntxW5aO-uJH8USLvlGm4Y"
  );

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    alert('User not authenticated.');
    return;
  }

  const userId = user.user.id;
  const { data: profile } = await supabase.from('users').select('owned_sets, wallet').eq('id', userId).single();
  const ownedSets = profile?.owned_sets || [];
  const walletInDB = profile?.wallet;
  const connectedWallet = userPublicKey.toBase58();

  if (walletInDB && walletInDB !== connectedWallet) {
    alert("This wallet does not match your linked wallet. Contact support to update it.");
    return;
  } else if (!walletInDB) {
    const confirmLink = confirm("Link this wallet to your account? This cannot be changed later!");
    if (confirmLink) {
      await supabase.from('users').update({
        owned_sets: ownedSets.includes(2) ? ownedSets : [...ownedSets, 2],
        wallet: connectedWallet
      }).eq('id', userId);
      document.getElementById('ownedSets').textContent = `Sets owned: ${[...ownedSets, 2].join(', ')}`;
    } else {
      alert("Wallet not linked. Purchase cancelled.");
      showLoadingSpinner(false);
      return;
    }
  }

  // Transaction instructions
  const userTokenAccount = await getAssociatedTokenAddress(masqMint, userPublicKey, false);
  const treasuryTokenAccount = await getAssociatedTokenAddress(masqMint, treasuryPublicKey, true);

  const instructions = [];
  const userATAInfo = await connection.getAccountInfo(userTokenAccount);
  if (!userATAInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        userPublicKey,
        userTokenAccount,
        userPublicKey,
        masqMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  const treasuryATAInfo = await connection.getAccountInfo(treasuryTokenAccount);
  if (!treasuryATAInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        userPublicKey,
        treasuryTokenAccount,
        treasuryPublicKey,
        masqMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  const amountToTransfer = 1_000;
  const transferIx = createTransferInstruction(
    userTokenAccount,
    treasuryTokenAccount,
    userPublicKey,
    amountToTransfer,
    [],
    TOKEN_PROGRAM_ID
  );
  instructions.push(transferIx);

  const transaction = new solanaWeb3.Transaction().add(...instructions);
  transaction.feePayer = userPublicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  try {
    const signedTx = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    showLoadingSpinner(false);
    alert(`Pack purchased successfully! Tx: ${signature}`);
  } catch (err) {
    console.error("Transaction error:", err);
    alert('Transaction failed. Check console for logs.');
  }
};
