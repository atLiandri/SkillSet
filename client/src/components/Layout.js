"use client"
import { VStack, Heading, Text, Flex, Image, Container, Box } from "@chakra-ui/react";
import React from "react";
import Header from "./Header";
import { motion } from "framer-motion";

import CrtEffect from "./CrtEffect";
// import { IsMobile } from "@/utils/ui";

const Layout = ({
  CustomLeftPanel,
  leftPanelProps,
  showBack,
  children,
  isSinglePanel = false,
  rigthPanelMaxH,
  rigthPanelScrollable = true,
  footer,
}) => {
  return (
    <>
      <Flex
        direction="column"
        position="fixed"
        boxSize="full"
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Header back={showBack} />
        <Container position="relative" px={["10px", "16px"]} py="16px">
          {!isSinglePanel &&
            (!CustomLeftPanel ? <LeftPanel {...leftPanelProps} /> : <CustomLeftPanel />)}
          <RightPanel
            flex={[!!leftPanelProps?.map ? "0" : "1", "1"]}
            footer={footer}
            isSinglePanel={isSinglePanel}
            rigthPanelMaxH={rigthPanelMaxH}
            rigthPanelScrollable={rigthPanelScrollable}
          >
            {children}
          </RightPanel>
        </Container>

        <Box maxH="30px" h="full" display={["none", "block"]} bg="neon.900" zIndex={1} />
      </Flex>
      <CrtEffect />
    </>
  );
};

const LeftPanel = ({ title, prefixTitle, map, imageSrc, ...props }) => {
  return (
    <VStack flex={["0", "1"]} my={["none", "auto"]} {...props}>
      <VStack zIndex="1" position={map ? "absolute" : "unset"} pointerEvents="none" spacing="0">
        <Text textStyle="subheading" textAlign="center" fontSize={["9px", "11px"]}>
          {prefixTitle}
        </Text>
        <Heading fontSize={["36px", "48px"]} textAlign="center" fontWeight="normal">
          {title}
        </Heading>
      </VStack>
      {map ? (
        <Flex w="100%">{map}</Flex>
      ) : (
        <Image src={imageSrc} maxH="60vh" h="500px" objectFit="contain" pt="60px" display={["none", "block"]} alt="context" />
      )}
    </VStack>
  );
};

const RightPanel = ({
  children,
  footer,
  isSinglePanel,
  rigthPanelMaxH,
  rigthPanelScrollable,
  ...props
}) => {
//   const isMobile = IsMobile();
  return (
    <VStack position="relative" w="full" {...props}>
      <VStack
        position="relative"
        flex="1"
        overflowY={rigthPanelScrollable ? "scroll" : "hidden"}
        __css={{
          "scrollbar-width": "none",
        }}
        w="full"
        maxH={rigthPanelMaxH ? rigthPanelMaxH : isSinglePanel ? "calc(100vh - 70px)" : "calc(100vh - 145px)"}
      >
        {children}
        {/* {!isSinglePanel && rigthPanelScrollable && (
          <Box display="block" minH={isMobile ? "170px" : "90px"} h={isMobile ? "170px" : "90px"} w="full" />
        )} */}
      </VStack>
      {footer}
    </VStack>
  );
};

export default Layout;
