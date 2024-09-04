import { Button, Divider, Flex, HStack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IsMobile, formatCashHeader } from "@/utils/ui";
import { useRouter } from "next/navigation";
import { initSoundStore } from "@/hooks/sound";
import HeaderButton from "@/components/HeaderButton";
import PixelatedBorderImage from "./icons/PixelatedBorderImage";
import colors from "@/theme/colors";
import { headerStyles, headerButtonStyles } from "@/theme/styles";

export const Header = ({ back }) => {
  const router = useRouter();
  // const { gameId } = router.query;
  const [inventory, setInventory] = useState(0);

  const isMobile = IsMobile();

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
        {!isMobile && (
          <>
            {/* Add any components you want here */}
          </>
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
