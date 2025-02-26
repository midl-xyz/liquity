import React from "react";
import { Box, Image } from "theme-ui";

type LiquityLogoProps = React.ComponentProps<typeof Box> & {
  height?: number | string;
};

export const LiquityLogo: React.FC<LiquityLogoProps> = ({ height, ...boxProps }) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <Box sx={{ lineHeight: 0 }} {...boxProps} as="a" href="https://midl.xyz">
    <Image src="./midl.svg" sx={{ height }} />
  </Box>
);
