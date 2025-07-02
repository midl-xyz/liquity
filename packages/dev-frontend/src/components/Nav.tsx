import { Flex, Box, Badge, Text, NavLink } from "theme-ui";
import { Link } from "./Link";

const TemporaryNewBadge = () => {
  const isBeforeNovember2022 = new Date() < new Date("2022-11-01");
  if (!isBeforeNovember2022) return null;
  return (
    <Badge ml={1} sx={{ fontSize: "12px" }}>
      New
    </Badge>
  );
};

export const Nav: React.FC<{
  hideLinks?: boolean;
}> = ({ hideLinks = false }) => {
  return (
    <Box as="nav" sx={{ display: ["none", "flex"], alignItems: "center", flex: 1 }}>
      <Flex>
        {!hideLinks && <Link to="/">Home</Link>}
        <NavLink href="https://game.midl.xyz" rel="noopener noreferrer" target="_blank">Game</NavLink>
        <NavLink href="https://swap.midl.xyz" rel="noopener noreferrer" target="_blank">Swap</NavLink>
        <NavLink href="https://medium.com/midl-xyz/pioneer-the-midl-testnet-56c412486f08" rel="noopener noreferrer" target="_blank">Guide</NavLink>
        <NavLink href="https://bootstrap.midl.xyz" rel="noopener noreferrer" target="_blank">Earn Midl</NavLink>

        {/* <Link to="/bonds">
          <Flex sx={{ alignItems: "center" }}>
            <Text>Bonds</Text>
            <TemporaryNewBadge />
          </Flex>
        </Link> */}
      </Flex>
      {!hideLinks && (
        <Flex sx={{ justifyContent: "flex-end", mr: 3, flex: 1 }}>
          <Link sx={{ fontSize: 1 }} to="/risky-troves">
            Risky Troves
          </Link>
        </Flex>
      )}
    </Box>
  );
};
