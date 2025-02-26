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
        {!hideLinks && <Link to="/">Dashboard</Link>}
        <NavLink href="https://devnet.midl.xyz">Devnet Portal</NavLink>
        <NavLink href="https://blockscout.regtest.midl.xyz">Explorer</NavLink>

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
