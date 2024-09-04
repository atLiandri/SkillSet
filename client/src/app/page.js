"use client"
import {
  Text,
  VStack,
  HStack,
  Divider,
  Card,
  Box,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Layout from "@/components/Layout";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
// import { Alert, Clock } from "@/components/icons";
// import Leaderboard from "@/components/Leaderboard";
import { useToast } from "@/hooks/toast";
import HomeLeftPanel from "@/components/HomeLeftPanel";
// import Tutorial from "@/components/Tutorial";
import { useEffect, useState } from "react";
import { play } from "@/hooks/media";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGated, setIsGated] = useState(false);

  useEffect(() => setIsGated(false), []);

  const disableAutoPlay = process.env.NEXT_PUBLIC_DISABLE_MEDIAPLAYER_AUTOPLAY === "true";
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const onHustle = async () => {
    if (!disableAutoPlay) {
      play();
    }

    setIsSubmitting(true);
    // Navigation logic after hustle action
    router.push(`/create/new`);
  };

  return (
    
    <Layout CustomLeftPanel={HomeLeftPanel} rigthPanelScrollable={false} rigthPanelMaxH="calc(100vh - 230px)">
      <VStack boxSize="full" gap="10px" justify="center">
        <Card variant="pixelated">
          <HStack w="full" p="20px" gap="10px" justify="center">
            {isGated ? (
              <VStack>
                <HStack>
                  {/* <Alert /> */}
                  <Text align="center">Under Construction</Text>
                </HStack>
                <Text align="center">Get ready hustlers... Season III starts in November</Text>
              </VStack>
            ) : (
              <>
               
                <Button flex="1" onClick={() => setIsTutorialOpen(true)}>
                  Tutorial
                </Button>
                {/* <ConnectButton flex="1" isLoading={isSubmitting} onClick={onHustle}/> */}
                <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} type="button">
                    Wrong network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
                <Button flex="1" isLoading={isSubmitting} onClick={onHustle}>
                
                </Button>
              </>
            )}
          </HStack>
        </Card>

        {!isGated && (
          <VStack
            boxSize="full"
            gap="20px"
            __css={{
              "scrollbar-width": "none",
            }}
          >
            {/* <Leaderboard /> */}
          </VStack>
        )}
      </VStack>

      {/* <Tutorial isOpen={isTutorialOpen} close={() => setIsTutorialOpen(false)} /> */}
    </Layout>
  );
}