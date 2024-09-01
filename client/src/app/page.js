import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import "./globals.css";
import Link from 'next/link';
import ClaimableRewardsButton from "./components/ClaimableRewardsButton"

export default function Home() {
  return (
    <>
       <nav className="sticky top-0 flex items-center justify-between bg-lightgreen opacity-100 shadow p-2 mb-8">
      {/* Flex container for logo and Dataset Page link */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-4">
          <Link href="/">
            
              <Image
                src="/favicon.ico"
                alt="SkillSet Logo"
                width={50} // Adjust the width as necessary
                height={50} // Adjust the height as necessary
                style={{ width: '50px', height: 'auto' }}
                priority
              />
           
          </Link>
        </h1>
        
        <Link legacyBehavior href="/">
          <a className="text-lg px-3 py-2px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">certificates</a>
        </Link>
        <ClaimableRewardsButton/>
      </div>
        <div>
          <ConnectButton />
        </div>
      </nav>
      <main className="flex   h-[calc(90vh-64px)]">
        <div className="flex-1 flex justify-center items-center border-r-4 border-black bg-white">
          <a href="/" className="text-6xl font-bold hover:text-8xl transition-all duration-500 ease-in-out">Collect</a>
        </div>

        <div className="flex-1 flex justify-center items-center bg-white">
          <a href="/" className="text-6xl font-bold hover:text-8xl transition-all duration-500 ease-in-out">Explore</a>
        </div>
      </main>
    </>
  );
}
