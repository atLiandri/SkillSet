import { Button, Divider, Flex, HStack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IsMobile, formatCashHeader } from "@/utils/ui";
import { useRouter } from "next/navigation";
import { initSoundStore } from "@/hooks/sound";
import { ProfileLink } from "./ProfileButton";
import { useAccount, useEnsName } from 'wagmi';

export const Header = ({ back }) => {
  const router = useRouter();
  const [inventory, setInventory] = useState(0);
  const { address } = useAccount(); // Fetch the connected account's address
  const isMobile = IsMobile(); // Check if the device is mobile

  useEffect(() => {
    const init = async () => {
      await initSoundStore();
    };
    init();
  }, []);

  return (
    <HStack
      w="full"
      px="10px"
      spacing="10px"
      zIndex="overlay"
      align="flex-start"
      py={["0", "20px"]}
      fontSize={["14px", "16px"]}
    >
      <HStack flex="1" justify={["left", "right"]}></HStack>
      <HStack flex="1" justify="right">
        {/* Right section with actions/buttons */}
        {!isMobile && address && (
          <ProfileLink/> // Show ProfileLink if not mobile and account is connected
        )}
        {isMobile && (
          <>
            {/* Mobile menu placeholder */}
          </>
        )}
      </HStack>
    </HStack>
  );
};

export default Header;
