import { Button as ChakraButton, Text } from "@chakra-ui/react";

// Can't seem to set first-letter css correctly on button in chakra theme
// so we do it here on text...
const Button = ({ children, ...props }) => (
  <ChakraButton {...props}>
    <Text
      as="div"
      w="full"
      textAlign="center"
      // css={{
      //   "&:first-letter": {
      //     textDecoration: "underline",
      //   },
      // }}
    >
      {children}
    </Text>
  </ChakraButton>
);

export default Button;
