import { ContractIds } from '@deployments/deployments';
import { BN } from '@polkadot/util';
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon';
import { contractTxWithToast } from '@utils/contractTxWithToast';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export type MintAttributes = {
  background: number;
  skin: number;
  eyes: number;
  lips: number;
  hair: number;
  clothes: number;
  hat: number;
  accessories: number;
  extra: number;
};

const TOKENS_TO_PAY = 100; // Tokens to pay for minting an NFT

export const NFTMint: FC<MintAttributes> = ({
    background,
    skin,
    eyes,
    lips,
    hair,
    clothes,
    hat,
    accessories,
    extra
  }) => {
  const { api, activeAccount, activeSigner } = useInkathon();
  const { contract } = useRegisteredContract(ContractIds.Collection);
  const [mintStatus, setMintStatus] = useState<string>();
  const { register, handleSubmit } = useForm<MintAttributes>();

  const mintNFT = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…');
      return;
    }

    setMintStatus('Minting...');
    try {

      const decimals = api.registry.chainDecimals?.[0] || 12
      const value = new BN(100).mul(new BN(10).pow(new BN(decimals)))
      
      //const paymentAmount = api.createType('Balance', TOKENS_TO_PAY); // Convert 100 tokens to the appropriate Balance type
      //console.log('paymentAmount', paymentAmount);

      // Assuming the function arguments are in the correct order
      await contractTxWithToast(api, activeAccount.address, contract, 'payableMintImpl::mint', { value: value }, [
        activeAccount.address,
        background,
        skin,
        eyes,
        lips,
        hair,
        clothes,
        hat,
        accessories,
        extra,
      ]);
      setMintStatus('Mint successful!');
    } catch (e) {
      console.error(e);
      toast.error('Error while minting NFT. Try again…');
      setMintStatus('Mint failed.');
    }
  };

  if (!api) return null;

  return (
    <>
      <div className="flex grow flex-col space-y-4 max-w-[20rem]">
        <h2 className="text-center font-mono text-gray-400">Mint NFT</h2>

        {/* Mint NFT Form */}
        <div className="p-4 border border-gray-300 rounded bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit(mintNFT)}>
            <div className="space-y-4">
              {/* Render input fields for each attribute */}
              <button
                type="submit"
                className="px-4 py-2 mt-4 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Mint NFT
              </button>
            </div>
          </form>
        </div>

        {/* Mint Status */}
        {mintStatus && (
          <div className="p-4 mt-2 border border-gray-300 rounded bg-white dark:bg-gray-800">
            {mintStatus}
          </div>
        )}
      </div>
    </>
  )
}
