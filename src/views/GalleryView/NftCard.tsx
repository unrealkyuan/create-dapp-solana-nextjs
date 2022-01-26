import { FC, useState, useEffect } from "react";
import useSWR from "swr";
import { EyeOffIcon } from "@heroicons/react/outline";
// import Image from 'next/image'
import { fetcher } from "utils/fetcher";

type Props = {
  details: any;
  onSelect: any;
  onTokenDetailsFetched?: (props: any) => unknown;
};

export const NftCard: FC<Props> = ({
  details,
  onSelect,
  onTokenDetailsFetched = () => {},
}) => {
  const [fallbackImage, setFallbackImage] = useState(false);
  const { name, uri } = details?.data ?? {};

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
  // console.log("data", data);

  useEffect(() => {
    if (!error && !!data) {
      onTokenDetailsFetched(data);
    }
  }, [data, error]);

  const onImageError = () => setFallbackImage(true);
  const { image } = data ?? {};

  if(!image) {
    return null;
  }

  // TODO: make the image a nextjs image for extra security.
  // will need to define external url domains https://nextjs.org/docs/api-reference/next/image#domains
  return (
    <div
      className={`card bordered max-w-xs compact rounded-md`}
      onSelect={onSelect}
    >
      <figure className="min-h-16 animation-pulse-color">
        {!fallbackImage || !error ? (
          <>
          <input type="radio" id="r1" name="radio" className="imageSelector"/>
          <label htmlFor="r1">
            <img
              src={image}
              alt={name}
              onError={onImageError}
              className="bg-gray-800 object-cover"
            />
          </label>
          </>
          
        ) : (
          // Fallback when preview isn't available
          // This could be broken image, video, or audio
          <div className="w-auto h-48 flex items-center justify-center bg-gray-900 bg-opacity-40">
            <EyeOffIcon className="h-16 w-16 text-white-500" />
          </div>
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title text-sm text-left">{name}</h2>
      </div>
    </div>
  );
};
