import { Icon as ChakraIcon,
         IconProps as ChakraIconProps,
    ThemingProps, } from "@chakra-ui/react";
import React from "react";
import { PersonA } from "./PersonA";

export interface AvatarProps extends ChakraIconProps, ThemingProps {
  color: "green" | "yellow";
  hasCrown?: boolean;
}

export const Avatar = ({ color = "green", hasCrown, ...props }: AvatarProps) => {
  return (
    <ChakraIcon viewBox="0 0 60 60" fill="none" {...props}>
      <PersonA color={color} hasCrown={hasCrown} />
    </ChakraIcon>
  );
};