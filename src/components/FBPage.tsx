'use client';

import { useEffect } from "react";

const FacebookPage = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
    document.body.appendChild(script);
  }, []);

  return (
    <div className="fb-page"
      data-href="https://www.facebook.com/aahmad016"
      data-width="380"
      data-hide-cover="false"
      data-show-facepile="false"></div>
  );
};

export default FacebookPage;