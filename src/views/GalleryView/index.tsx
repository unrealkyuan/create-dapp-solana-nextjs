import Link from "next/link";
import { FC, useState, useCallback } from "react";
import useSWR from "swr";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletNfts, NftTokenAccount } from "@nfteyez/sol-rayz-react";
import { useConnection } from "@solana/wallet-adapter-react";
import Gallery from 'react-photo-gallery';

import { Loader, SelectAndConnectWalletButton } from "components";
import SelectedImage from "./SelectedImage";
import { NftCard } from "./NftCard";
import { fetcher } from "utils/fetcher";
import styles from "./index.module.css";
const walletPublicKey = "";

declare type Photo = {
  src: string;
  width: number;
  height: number;
};
/* Connection is set to devnet. Comment out connection to use mainnet */
export const GalleryView: FC = ({}) => {
  const { connection } = useConnection();
  const [walletToParsePublicKey, setWalletToParsePublicKey] =
    useState<string>(walletPublicKey);
  const { publicKey } = useWallet();

  const { nfts, isLoading, error } = useWalletNfts({
    publicAddress: walletToParsePublicKey,
    //connection,
  });

  console.log("nfts", nfts);

  // const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = e.target;
  //   setWalletToParsePublicKey(value.trim());
  // };

  const onUseWalletClick = () => {
    if (publicKey) {
      setWalletToParsePublicKey(publicKey?.toBase58());
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
      <div className={styles.container}>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
          <div className="flex-none">
            <button className="btn btn-square btn-ghost">
              <span className="text-4xl">🏞</span>
            </button>
          </div>
          <div className="flex-1 px-2 mx-2">
            <div className="text-sm breadcrumbs">
              <ul className="text-xl">
                <li>
                  <Link href="/">
                    <a>Templates</a>
                  </Link>
                </li>
                <li>
                  <span className="opacity-40">NFT Gallery</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex-none">
            <WalletMultiButton className="btn btn-ghost" />
            <SelectAndConnectWalletButton
              onUseWalletClick={onUseWalletClick}
            />
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 p-0 pt-10">
            <div className="text-center hero-content w-full">
              <div className="w-full">
                <h1 className="mb-5 text-5xl">
                  select nfts to display!
                </h1>

                <div className="my-10">
                  {error || !publicKey? (
                    <div>
                      <h1>Reconnect Wallet</h1>
                    </div>
                  ) : null}

                  {!publicKey || 
                  !error && isLoading ? (
                    <div>
                      <Loader />
                    </div>
                  ) : (
                    <NftList nfts={nfts} error={error} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type NftListProps = {
  nfts: NftTokenAccount[];
  error?: Error;
};

const NftList = ({ nfts, error }: NftListProps) => {
    // selected NFTs list
    const [selectedNfts, updateSelectedNfts] = useState<NftTokenAccount[]>([]); 
  if (error) {
    return null;
  }

  if (!nfts?.length) {
    return (
      <div className="text-center text-2xl pt-16">
        No NFTs found in this wallet
      </div>
    );
  }

  // return (
  //   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
  //     {nfts?.map((nft) => (
  //       <NftCard key={nft.mint} details={nft} onSelect={() => updateSelectedNfts(nfts)} />
  //     ))}
  //   </div>
  // );
  
  let nftImages : Photo[] = [];
  nfts?.forEach(function (nft) {
    const { name, uri } = nft?.data ?? {};
    const { data, error } = useSWR(
      // uri || url ? getMetaUrl(details) : null,
      uri,
      fetcher,
      {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }
    );
    const { image } = data ?? {};

    if(!image) {
      return null;
    }

    const props: Photo = {
      src: image,
      width: 1,
      height: 1,
    }
    nftImages.push(props);
  });
  
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const imageRenderer = useCallback(
    ({ index, left, top, key, photo }) => (
      <SelectedImage
        selected={selectAll ? true : false}
        key={key}
        margin={"2px"}
        index={index}
        photo={photo}
        left={left}
        top={top}
        direction={"row"} // row or column, is row-oriented by default
      />
    ),
    [selectAll]
  );

  return (
    <div>
      <p>
        <button onClick={toggleSelectAll}>toggle select all</button>
      </p>
      <Gallery photos={nftImages} renderImage={imageRenderer} />
    </div>
  );

  // return (
  //   <div>
  //     <ImagePicker 
  //       images={nftImages?.map((img, i) => ({src: img, value: i}))}
  //       onPick={() => {}}
  //     />
  //     <button type="button" onClick={() => console.log("hello")}>OK</button>
  //   </div>
  // )
};
