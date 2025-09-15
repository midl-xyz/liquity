import { Button, Text, Link, Flex, Image } from "theme-ui";
import type { FC } from "react";

type Props = {
  name: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
};

export const ErrorScreen: FC<Props> = ({ name, description, buttonHref, buttonText }) => {
  return (
    <Flex
      sx={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        background: "white",
        position: "relative"
      }}
    >
      <Image
        src="/background.svg"
        alt="background"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute"
        }}
      />
      <Flex
        sx={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 15,
          backgroundColor: "#FFFFFFCC",
          backdropFilter: "blur(0.25px)",
          padding: 12,
          borderRadius: "200px"
        }}
      >
        <Flex
          sx={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2
          }}
        >
          <Text
            sx={{
              fontWeight: 500,
              fontSize: ["40px", "120px"],
              letterSpacing: "0.2px",
              fontVariationSettings: "'wdth' 110",
              wordBreak: "break-all",
              color: "#DC7520"
            }}
          >
            {name}
          </Text>
          <Text
            sx={{
              textAlign: "center",
              fontSize: "24px"
            }}
          >
            {description}
          </Text>
        </Flex>

        <Link href={buttonHref || "/"}>
          <Button
            sx={{
              background: "#0000009b",
              borderRadius: "80px",
              paddingX: 5,
              paddingY: 2
            }}
            variant="primary"
          >
            {buttonText || "Back to main page"}
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
};
