import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";

export const metadata = {
  title: "SkillSet ",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
